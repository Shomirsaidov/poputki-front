# Image and File Upload Setup (Cloudinary)

In this project, we use **Cloudinary** for storing and serving all media assets (images, PDFs, videos, presentations, etc.).

## 🔑 Secret API Keys

To replicate this setup in other environments or by another AI assistant, here are the hardcoded Cloudinary credentials currently used in the backend (`server/index.js`):

- **Cloud Name**: `dlmnievol`
- **API Key**: `365173165178178`
- **API Secret**: `RHw8S9slXFHNEzxvKKltYiCgfnE`
- **Secure Mode**: `true`

## 🛠 Technology Stack & Mechanics

Our process relies on the official Cloudinary SDK on the Node.js backend:
- [`cloudinary`](https://www.npmjs.com/package/cloudinary) (^2.9.0): The official SDK for uploading and managing assets.

Unlike traditional file uploads using `multipart/form-data`, we use a **Base64-to-Server** approach. This is more compatible with serverless environments and simplifies the handoff between client and server.

### 1. Configuration (`server/index.js`)
Cloudinary is configured globally at server startup. We also increase the JSON payload limit to accommodate large Base64 strings:

```javascript
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: 'dlmnievol',
    api_key: '365173165178178',
    api_secret: 'RHw8S9slXFHNEzxvKKltYiCgfnE',
    secure: true,
});

// Increase JSON limit for Base64 uploads
app.use(express.json({ limit: '50mb' }));
```

### 2. Upload Utility (`server/utils/cloudinaryUtils.js`)
We abstract the upload logic into `uploadToCloudinary`. It takes a Base64 string (Data URI) and uses the Cloudinary `upload` method:

```javascript
const { v2: cloudinary } = require('cloudinary');

function uploadToCloudinary(fileBase64, options = {}) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(fileBase64, options, (error, result) => {
            if (error) return reject(error);
            resolve({
                url: result.secure_url,
                public_id: result.public_id
            });
        });
    });
}
```

### 3. Route Handlers (e.g., `server/routes/busAdmin.js`)
When an endpoint needs to handle a file upload, it receives the Base64 string directly in the request body.

```javascript
router.put('/tickets/:id', async (req, res) => {
    const { photos } = req.body; // Array of Base64 strings or existing photo objects
    
    // ...
    for (const photo of photos) {
        if (typeof photo === 'string' && photo.startsWith('data:image')) {
            const r = await uploadToCloudinary(photo, { folder: 'poputki/bus_photos' });
            // Save r.url and r.public_id to database
        }
    }
});
```

### 4. Deletion
To delete an asset (e.g., when a photo is removed or a ticket is deleted), we use the `public_id`:

```javascript
await cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
```

## 📋 Implementation Checklist
1. **Frontend**: Select files using `<input type="file">`.
2. **Frontend**: Convert files to Base64 using `FileReader.readAsDataURL()`.
3. **Backend**: Receive the string in a JSON field.
4. **Backend**: Pass the string directly to `uploadToCloudinary`.
5. **Database**: Store the returned `url` and `public_id`.

### Summary
1. Client converts file to Base64 (Data URI) locally.
2. Client sends Base64 string to Backend as part of a standard JSON object.
3. Backend passes the Base64 string to Cloudinary SDK.
4. Cloudinary responds with the file's CDN URL and `public_id`.
5. We save the URL and `public_id` in our Supabase database.

