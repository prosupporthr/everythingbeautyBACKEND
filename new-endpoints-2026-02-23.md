# New API Endpoints – 2026-02-23

This document lists the backend endpoints added/updated today, including their payloads and usage details. Share this with the frontend team.

---

## 1. Bulk Mark Notifications as Read

- **Method**: `POST`
- **Path**: `/notifications/bulk-read`
- **Auth**: JWT Bearer (same as other notification endpoints)

### Description

Bulk mark multiple notifications as read. Behavior depends on `userType`:

- `user`: sets `isRead = true` on each specified notification.
- `admin`: adds the admin’s ID into the `readBy` array for each notification.

### Request

**Headers**

- `Authorization: Bearer <JWT>`

**Body (JSON)**

```json
{
  "ids": ["64f7c2d91c2f4a0012345678", "64f7c2d91c2f4a0012345679"],
  "userType": "user",
  "adminId": "64f7c2d91c2f4a0012345670"
}
```

**Fields**

- `ids` (`string[]`, required)  
  List of notification IDs to update.

- `userType` (`string`, required)
  - Allowed values: `"user"` or `"admin"`.
  - `"user"` → normal user bulk read.
  - `"admin"` → admin bulk read (uses `adminId`).

- `adminId` (`string`, required when `userType = "admin"`)  
  Admin’s MongoDB ID to store in `readBy`.

### Response (Success)

```json
{
  "success": true,
  "message": "Notifications marked as read successfully",
  "data": null
}
```

On validation or logic errors, the same `ReturnType` structure is used with `success: false` and an error `message`.

---

## 2. Get Current Authenticated User

- **Method**: `GET`
- **Path**: `/user/me`
- **Auth**: JWT Bearer (user)

### Description

Returns the currently authenticated user based on the JWT. Internally this:

- Reads the user from the request (set by the auth guard).
- Loads the full user data via `getUserById`, including enriched fields like profile picture and business.

### Request

**Headers**

- `Authorization: Bearer <JWT>`

**Query / Body**

- None.

### Response (Success)

```json
{
  "success": true,
  "message": "User details fetched successfully",
  "data": {
    "id": "64f7c2d91c2f4a0012345678",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": "https://signed-url-to-avatar",
    "business": {
      /* business details if any */
    }
    // other user fields...
  }
}
```

On invalid/expired token or blocked account, the route returns a 401/403-style error with the same `ReturnType` envelope where applicable.

---

## 3. Mark Chat Messages as Read (Bulk)

- **Method**: `POST`
- **Path**: `/messaging/messages/mark-read`
- **Auth**: JWT Bearer (user)

### Description

Bulk mark one or more chat messages as read by setting `isRead = true` for each message ID provided.

### Request

**Headers**

- `Authorization: Bearer <JWT>`

**Body (JSON)**

```json
{
  "ids": ["64f7c2d91c2f4a0012345678", "64f7c2d91c2f4a0012345679"]
}
```

**Fields**

- `ids` (`string[]`, required)  
  List of `ChatMessage` IDs to mark as read.

Notes:

- IDs must be valid MongoDB ObjectIds.
- Messages that are soft-deleted (`isDeleted = true`) are ignored.

### Response (Success)

```json
{
  "success": true,
  "message": "Messages marked as read successfully",
  "data": null
}
```

If no valid IDs are found:

```json
{
  "success": false,
  "message": "No valid message IDs provided",
  "data": null
}
```

---

## 4. Get Unread Message Count for a Chat

- **Method**: `GET`
- **Path**: `/messaging/chats/:chatId/unread-count`
- **Auth**: JWT Bearer (user)

### Description

Returns the number of unread chat messages (`isRead = false`) for a specific chat.

### Request

**Headers**

- `Authorization: Bearer <JWT>`

**Path Parameters**

- `chatId` (`string`, required)  
  MongoDB ID of the chat.

**Example**

```http
GET /messaging/chats/64f7c2d91c2f4a0012345678/unread-count
Authorization: Bearer <JWT>
```

### Response (Success)

```json
{
  "success": true,
  "message": "Unread message count fetched successfully",
  "data": {
    "count": 3
  }
}
```

If `chatId` is invalid:

```json
{
  "success": false,
  "message": "Invalid chatId",
  "data": null
}
```
