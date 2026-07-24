# from web3 import Web3
# import json
# import os

# w3 = Web3(Web3.HTTPProvider(os.getenv("WEB3_PROVIDER_URL")))

# owner_address = os.getenv("OWNER_ADDRESS")
# owner_key = os.getenv("OWNER_PRIVATE_KEY")
# contract_address = os.getenv("COURSE_MODULE_SOULBOUND_ADDRESS")

# with open("path/to/CourseModuleSoulbound.json") as f:
#     artifact = json.load(f)

# contract = w3.eth.contract(address=contract_address, abi=artifact["abi"])

# txn = contract.functions.mintModuleCompletion(
#     "0xStudentAddressHere",
#     "My Course Name",
#     "Module 1"
# ).buildTransaction({
#     "chainId": 31337,
#     "gas": 400000,
#     "nonce": w3.eth.get_transaction_count(owner_address),
#     "gasPrice": w3.eth.gas_price,
# })

# signed = w3.eth.account.sign_transaction(txn, owner_key)
# tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
# receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

# print("Minted:", receipt.transactionHash.hex())