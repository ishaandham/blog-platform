<!--{
    "title": "JWT Authentication" ,
    "author": "Ishaan",
    "tags": ["web", "webdev", "jwt", "authentication"]
}-->
# Json Web Token (JWT)

A token holding JSON that asserts claims (statements about entity) and can be signed and encrypted.

It is commonly used in authentication and avoids sending credentials on every request. A JWT is created by the server and signed using a 'secret key'. The user of the service can then use this JWT to gain access to authenticated endpoints.

## JWT Structure
```
xxxxx.yyyyy.zzzzz
```

A JWT consists of three parts:

* Header - Consists of type of token and signing algorithm (RSA, SHA256)
* Payload - Consists of "Claims". Claims are statements about the user and more details.
* Signature - Signature part takes the encoded header, payload and secret and uses an algorithm to sign it.




