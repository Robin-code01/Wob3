import re
import secrets

from django.contrib.auth import get_user_model, login
from django.core.cache import cache
from django.utils import timezone
from eth_account import Account
from eth_account.messages import encode_defunct
from rest_framework.decorators import api_view
from rest_framework.response import Response
from siwe import SiweMessage, generate_nonce

# from web3 import Web3
# from django.conf import settings

# w3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER_URL))

# contract = w3.eth.contract(
#     address=settings.COURSE_MODULE_SOULBOUND_ADDRESS,
#     abi=settings.COURSE_MODULE_SOULBOUND_ABI,
# )


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
