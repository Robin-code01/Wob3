from django.shortcuts import render
from eth_account.messages import encode_defunct
from eth_account import Account
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view


def recover_signer(message: str, signature: str) -> str:
    encoded = encode_defunct(text=message)
    recovered_address = Account.recover_message(encoded, signature=signature)
    return recovered_address.lower()


@api_view(['POST'])
def verify_signature(request):
    # in your view:
    recovered = recover_signer(message, signature)
    if recovered != claimed_address.lower():
        return Response({"error": "signature mismatch"}, status=401)


# then manually check nonce, domain, expiry yourself since siwe isn't parsing the message for you
# Create your views here.
