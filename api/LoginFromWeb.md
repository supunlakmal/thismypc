

# Login From Web 
Loging for web site

**URL** : `http://thismypc.com:5000/login`

**Method** : `POST`

**Request Header**

```json
{
"Content-Type" : "application/json"
}
```

**Request Body**

```json
{ "email":"user@gamil.com", "password":"^%$fghkjh6" }
```

## 200 OK

**Code** : `200`

**Content example**

```json
{ "status": true, "message": "Hello!", "data": { "name": "Supun", "auth": "bfc6f0295bbab0c80b3d3cfb55dfe5", "id": "5c3d6a25221d01eba0afc9", "ioSocketID": "room1" } }
```
>
## 401 Unauthorized

**Code** : `401`

**Content example**

```json
{ "status": false, "message": "Invalid User", "data": null }
```
> 
