import json
import re
import secrets
import time

from django.contrib.auth import get_user_model, login
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from django.utils import timezone
from eth_account import Account
from eth_account.messages import encode_defunct
from rest_framework.decorators import api_view
from rest_framework.response import Response
from siwe import SiweMessage, generate_nonce
from web3 import Web3
from django.conf import settings
from core.models import Module
import os


# Helper to recover signer from a message+signature
def recover_signer(message: str, signature: str) -> str:
    encoded = encode_defunct(text=message)
    recovered_address = Account.recover_message(encoded, signature=signature)
    return recovered_address.lower()


@api_view(["GET"])
def get_nonce(request):
    nonce = generate_nonce()
    # Store nonce globally (not per-address) since RainbowKit's getNonce()
    # doesn't have access to the wallet address yet
    cache.set(f"nonce:{nonce}", nonce, timeout=300)
    return Response({"nonce": nonce})


@api_view(["POST"])
def verify_signature(request):
    message = request.data.get("message")
    signature = request.data.get("signature")
    address = request.data.get("address")

    if not all([message, signature, address]):
        return Response(
            {"error": "message, signature, and address are required"}, status=400
        )

    address = address.lower()

    # 1. Recover the address that actually produced this signature
    try:
        recovered = recover_signer(message, signature)
    except Exception as e:
        return Response({"error": f"invalid signature: {e}"}, status=401)

    if recovered != address:
        return Response({"error": "signature does not match claimed address"}, status=401)

    # 2. Extract the nonce from the SIWE message using the siwe library
    try:
        siwe_msg = SiweMessage.from_message(message)
        nonce_in_message = siwe_msg.nonce
    except Exception as e:
        return Response({"error": f"could not parse SIWE message: {e}"}, status=400)

    # 3. Verify nonce is valid and hasn't been used
    expected_nonce = cache.get(f"nonce:{nonce_in_message}")
    if not expected_nonce or nonce_in_message != expected_nonce:
        return Response({"error": "invalid or expired nonce"}, status=401)

    # 4. Nonce is valid — burn it immediately so it can't be replayed
    cache.delete(f"nonce:{nonce_in_message}")

    UserModel = get_user_model()
    user, created = UserModel.objects.get_or_create(public_key=recovered)
    login(request, user)

    return Response({
        "ok": True,
        "address": address,
        "created": created,
    })


def _get_web3_and_contract():
    w3 = Web3(Web3.HTTPProvider(os.getenv("WEB3_PROVIDER_URL")))
    
    # Get ABI from Django settings (loaded from file) or environment variable
    abi = settings.COURSE_MODULE_SOULBOUND_ABI
    if not abi or abi == []:
        abi_json_str = os.getenv("COURSE_MODULE_SOULBOUND_ABI")
        if abi_json_str:
            try:
                abi = json.loads(abi_json_str)
            except json.JSONDecodeError as e:
                raise ValueError(f"COURSE_MODULE_SOULBOUND_ABI environment variable contains invalid JSON: {e}")
        else:
            raise ValueError(
                "COURSE_MODULE_SOULBOUND_ABI not found in settings or environment. "
                "On deployed servers, set COURSE_MODULE_SOULBOUND_ABI as an environment variable with the contract ABI as JSON."
            )
    
    if not abi:
        raise ValueError("COURSE_MODULE_SOULBOUND_ABI is empty")
    
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(os.getenv("COURSE_MODULE_SOULBOUND_ADDRESS")),
        abi=abi,
    )
    return w3, contract


def _mint_module_completion_transaction(student: str, course_name: str, module_name: str) -> str:
    # Validate required environment variables
    required_vars = {
        "WEB3_PROVIDER_URL": os.getenv("WEB3_PROVIDER_URL"),
        "COURSE_MODULE_SOULBOUND_ADDRESS": os.getenv("COURSE_MODULE_SOULBOUND_ADDRESS"),
        "OWNER_ADDRESS": os.getenv("OWNER_ADDRESS"),
        "OWNER_PRIVATE_KEY": os.getenv("OWNER_PRIVATE_KEY"),
    }
    
    missing_vars = [k for k, v in required_vars.items() if not v]
    if missing_vars:
        raise ValueError(f"Missing environment variables: {', '.join(missing_vars)}")
    
    w3, contract = _get_web3_and_contract()
    owner_address = Web3.to_checksum_address(os.getenv("OWNER_ADDRESS"))
    owner_key = os.getenv("OWNER_PRIVATE_KEY")

    # Ensure student address is checksum format
    student = Web3.to_checksum_address(student)

    func = contract.functions.mintModuleCompletion(student, course_name, module_name)
    try:
        gas_est = func.estimateGas({"from": owner_address})
        gas_limit = int(gas_est * 1.3)
    except Exception as e:
        print(f"Gas estimation failed: {e}")
        gas_limit = 300000

    nonce = w3.eth.get_transaction_count(owner_address)
    
    # Build base transaction dict - DO NOT include gasPrice initially
    tx_dict = {
        "from": owner_address,
        "nonce": nonce,
        "gas": gas_limit,
        "chainId": w3.eth.chain_id,
    }
    
    # Check if network supports EIP-1559
    try:
        latest_block = w3.eth.get_block('latest')
        if 'baseFeePerGas' in latest_block:
            # EIP-1559 network - use maxFeePerGas and maxPriorityFeePerGas
            base_fee = latest_block['baseFeePerGas']
            max_priority_fee = w3.eth.max_priority_fee
            tx_dict["maxPriorityFeePerGas"] = max_priority_fee
            tx_dict["maxFeePerGas"] = base_fee * 2 + max_priority_fee
        else:
            # Legacy network - use gasPrice
            tx_dict["gasPrice"] = w3.eth.gas_price
    except Exception as e:
        print(f"Error detecting EIP-1559: {e}, falling back to gasPrice")
        # Fallback to legacy gasPrice
        tx_dict["gasPrice"] = w3.eth.gas_price
    
    tx = func.buildTransaction(tx_dict)

    signed = w3.eth.account.sign_transaction(tx, private_key=owner_key)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    return tx_hash.hex()


@api_view(["POST"])
def mint_module_completion(request):
    """Owner-signed endpoint to mint a single module completion token to a student's wallet.

    Body: {
      "student_public_key": "0x...",
      "course_name": "Course Name",
      "module_name": "Module Name"
    }
    """
    student = request.data.get("student_public_key")
    course_name = request.data.get("course_name")
    module_name = request.data.get("module_name")

    if not all([student, course_name, module_name]):
        return Response({"error": "student_public_key, course_name, and module_name are required"}, status=400)

    student = student.lower()

    try:
        tx_hash = _mint_module_completion_transaction(student, course_name, module_name)
        return Response({"tx_hash": tx_hash}, status=202)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def mint_module_completion_by_id(request):
    """Owner-signed endpoint to mint a module completion token by module_id.

    Body: {
      "student_public_key": "0x...",
      "module_id": 123
    }
    """
    student = request.data.get("student_public_key")
    module_id = request.data.get("module_id")

    if not all([student, module_id]):
        return Response({"error": "student_public_key and module_id are required"}, status=400)

    try:
        module = get_object_or_404(Module, module_id=module_id)
        course_name = module.course_id.title
        module_name = module.title
        tx_hash = _mint_module_completion_transaction(student.lower(), course_name, module_name)
        return Response({"tx_hash": tx_hash}, status=202)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


