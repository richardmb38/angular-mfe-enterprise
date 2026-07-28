# Self Signed HTTPS Certificate

This is a self signed https certificate and certificate authority for use in local development. This cert is
used when running locally via `npm run start` command that they are done via https instead of http.
This cert is good for until "Tuesday, May 9, 2027".

### Accept the self-sign SSL Certificate

Each time you run locally you'll get a warning about an unsafe website because of the self signed SSL cert. In
order to avoid this annoyance you need to trust the self sign certificate.

**OS X**: Open KeyChain Access, select "System", then "Certificates" in the left hand menu. Drag the
[server.crt](server.crt) certificate to the key chain. Open the certificate inside KeyChain Access and
expand the trust settings. Under the trust settings select 'Always Trust' for Secure Socket Layer (SSL). Close
the window to save the new settings. Close and restart Chrome.

FireFox does not accept the self signed certificate. You will need to navigate to the local dev server on FireFox
and click through the warnings to add the certificate expection. Be sure to check the checkbox "make permanent" so
don't have to do it again in the future.

**Windows**: In Chrome going to "Options" and "Under The Hood", and "Manage certificates" add the
[server.crt](server.crt) as a trusted certificate.

Firefox does not accept self signed certificates from

### Here are the commands to create the cert

```
openssl req \
    -newkey rsa:2048 \
    -x509 \
    -nodes \
    -keyout server.key \
    -new \
    -out server.crt \
    -subj /CN=localhost \
    -reqexts SAN \
    -extensions SAN \
    -config <(cat /System/Library/OpenSSL/openssl.cnf \
        <(printf '[SAN]\nsubjectAltName=DNS:localhost')) \
    -sha256 \
    -days 3650
```

**Note**: A .pem file may be required for self signed certificates. When generating a copy can be made of the .crt
file and renamed with a .pem extension due to the generated .crt file being base64 encoded.
