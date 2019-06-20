
# User Register 
Create an Account for the authenticated User if an Account for that User does not already exist. Each User can only have one Account.

**URL** : `http://thismypc.com:5000/register`

**Method** : `POST`

**Request Header**

```json
{
"Content-Type" : "application/json"
}
```

**Request Body**

```json
{ "email":"demouser@gmail.com", "password":"^ghfhfg", "name":"Demo User" }
```

## 200 OK

**Code** : `200`

**Content example**

```json
{ "status": true, "message": "Hello!", "data": { "name": "Demo User", "auth": "29ffe009f1b36a6aebf89138647449", "id": "5cdff3de3435a35b7e5e7e0", "ioSocketID": "room1" } }
```

## 401 Unauthorized

**Code** : `401`

**Content example**

```json
{ "status": false, "message": "User Already exit", "data": null }
```
