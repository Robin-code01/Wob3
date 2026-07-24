from eth_account.messages import encode_defunct
from eth_account import Account
from siwe import SiweMessage  # pip install siwe

def verify_siwe(request):
    data = request.data
    message = data["message"]      # the SIWE-formatted string the frontend signed
    signature = data["signature"]

    siwe_msg = SiweMessage.from_message(message)

    try:
        siwe_msg.verify(signature, nonce=cached_nonce_for(siwe_msg.address))
    except Exception:
        return Response({"error": "invalid signature"}, status=401)

    address = siwe_msg.address.lower()
    user, _ = User.objects.get_or_create(username=address, defaults={"wallet_address": address})

    login(request, user)  # or issue a JWT here instead
    return Response({"ok": True})