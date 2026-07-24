import re
import secrets

from django.contrib.auth import login
from django.contrib.auth.models import User
from django.core.cache import cache
from eth_account import Account
from eth_account.messages import encode_defunct
from rest_framework.decorators import api_view
from rest_framework.response import Response


def recover_signer(message: str, signature: str) -> str:
    encoded = encode_defunct(text=message)
    recovered_address = Account.recover_message(encoded, signature=signature)
    return recovered_address.lower()


@api_view(["GET"])
def get_nonce(request):
    address = request.query_params.get("address")
    if not address:
        return Response({"error": "Address parameter is required"}, status=400)

    address = address.lower()
    nonce = secrets.token_hex(16)

    cache.set(f"siwe_nonce:{address}", nonce, timeout=300)

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
    except Exception:
        return Response({"error": "invalid signature"}, status=401)

    if recovered != address:
        return Response({"error": "signature does not match claimed address"}, status=401)

    # 2. Pull the nonce out of the signed message and compare to what we issued
    match = re.search(r"Nonce:\s*(\w+)", message)
    if not match:
        return Response({"error": "nonce not found in message"}, status=400)
    nonce_in_message = match.group(1)

    expected_nonce = cache.get(f"siwe_nonce:{address}")
    if not expected_nonce or nonce_in_message != expected_nonce:
        return Response({"error": "invalid or expired nonce"}, status=401)

    # 3. Nonce is valid — burn it immediately so it can't be replayed
    cache.delete(f"siwe_nonce:{address}")

    # 4. Signature + nonce both check out — log the user in
    user, _ = User.objects.get_or_create(username=address)
    login(request, user)

    return Response({"ok": True, "address": address})