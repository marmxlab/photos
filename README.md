#Photos

A simple, easy-to-use, web-based and self-hosted photo sharing system.

### Motivations

I stored a lot of pictures and videos that I took on my Ubuntu server. Since there is no GUI on the server, it was very 
difficult for me to review them and share them with other people. This is why I wanted to build a software that can be easily 
setup and uses the browsers as the GUI of it. 

---

### Features
1. Easy to Setup
2. Simple Password Protection
3. Thumbnail Generation

---

### Supported File Formats

#### For thumbnail generations
File formats in thumbnail generation are determined by their MIME types. 
Currently, the software generates thumbnails for files with one of the following MIME types:
````
  [
    'image/jpeg', 
    'image/bmp', 
    'image/png', 
    'image/webp', 
    'image/heic',
    'video/mp4', 
    'video/mpeg',
    'video/ogg', 
    'video/webm', 
    'video/quicktime'
  ]
````

#### For previewing through UI
Not all media files can be previewed on the UI due to the limitations in the browsers. To determine whether a file
can be previewed or not on the browser, the software looks at its file extension. Here is the list of file
extensions that can be previewed on the browser:

````
  [
    'bmp', 
    'jpg', 
    'jpeg', 
    'png', 
    'mp4',
    'webm', 
    'ogg',
    'mov'
  ]
````

---

### Installation

Although there are two ways to install the software, installing through Docker is highly recommended. 

#### Install through Docker

1\. Copy-and-paste the following sample `docker-compose.yml` to your filesystem.
````
version: '3'
services:
  redis-server:
    image: 'redis'
  node-app:
    image: marmxlab/photos-app:latest
    volumes: 
      - photos:/data/photos
      - thumbnails:/data/photos/.thumbnails
    ports:
      - "3000:3000"
    environment:
      - ROOT_FOLDER=/data/photos
      - THUMBNAIL_FOLDER=/data/photos/.thumbnails
      - REDIS_HOST=redis-server
      - REDIS_PORT=6379
    depends_on:
      - redis-server
  node-worker:
    image: marmxlab/photos-worker:latest
    volumes:
      - photos:/data/photos
      - thumbnails:/data/photos/.thumbnails
    environment:
      - REDIS_HOST=redis-server
      - REDIS_PORT=6379
    depends_on:
      - redis-server
volumes:
  photos: 
    driver: local
    driver_opts:
      o: bind
      type: none
      device: ${MEDIA_PATH}
  thumbnails:
    driver: local
    driver_opts:
      o: bind
      type: none
      device: ${THUMBNAIL_PATH}
````

2\. Specify the paths of the folder that has the media files you want to share and the folder to store thumbnails. 
   **Make sure both folders are created before running the software and are not the same folder**.

- Change ``${MEDIA_PATH}`` in the ``volumes`` section in the `docker-compose.yml` to the path of the folder that 
contains your media files that you want to share. For example: /Users/user/Pictures

- Change ``${THUMBNAIL_PATH}`` in the ``volumes`` section in the `docker-compose.yml` to the path of the folder that 
stores all the generated thumbnails. For example: /Users/user/Pictures/.thumbnails

3\. If you wish to change the port number that the server listens on, change `ports` section in
the `docker-compose.yml`. For example: `- "80:3000"`.

````
    ports:
      - "3000:3000"
````

4\. Run the following command in the directory where you saved your docker-compose.yml to start the software.

````
  docker-compose up -d
````

5\. Open your browser and enter the url `http://localhost:3000/`

#### Install and running manually with node and npm

You will need to have node, npm, redis, ffmpeg and ImageMagick (with libheif support) installed on your system.

1\. Clone this repository.
````
  git clone https://github.com/marmxlab/photos.git
````

2\. Clone `photos-worker` repository.
````
  git clone https://github.com/marmxlab/photos-worker.git
````

3\. Run npm install inside both folders.
````
  cd photos
  npm install
````
````
  cd photos-worker
  npm install
````

4\. Build both apps.
````
  cd photos
  npm run build
````
````
  cd photos-worker
  npm run build
````
Now the builds are in the `dist` folder of both apps.

5\. Copy the `.env.example` file and paste it to the `dist` folder and name it as `.env`. Update the content
    according to your needs. Check Configuration section for more details. Do this for both apps.
   
````
  cd photos
  cp .env.example dist/.env
````
````
  cd photos-worker
  cp .env.example dist/.env
````

6\. Run Redis server.
````
  redis-server
````

7\. Run npm start both apps.
````
  cd photos
  node index.js
````
````
  cd photos-worker
  node index.js
````

### Configurations

Configurations can be changed by updating the content of  `.env` for both `photos-app` and `photos-worker`. 
Here is the list of configurations:

Here are the configs for both `photos-app` and `photos-worker`:

| Variable Name  | Default Value | Description              |
| -------------- | ------------- | ------------------------ |
| REDIS_HOST     | localhost     | Redis server's address   |
| REDIS_PORT     | 6379          | Redis server's port      |
| REDIS_PASSWORD |               | Redis server's password  |

Here are the configs for `photos-app`:

| Variable Name    | Default Value | Description                                |
| ---------------- | ------------- | ------------------------------------------ |
| PORT             | 3000          | The port number that the server listens on |
| AUTH_SECRET      |               | Specify to enable site authorization. You will be asked to enter this value before you can view any content. **DO NOT** use sensitive password as the password will be transmitted in plain text multiple when viewing the content.|
| ROOT_FOLDER      | _required_    | Redis server's password                    |
| THUMBNAIL_FOLDER | _required_    | Redis server's password                    |

### Architecture
Here is the list of technologies used to implement the main features.

| Name  | Purpose(s) |
| ---- | ----------- |
| [Bull](https://github.com/OptimalBits/bull) | Distributing jobs to `photos-worker` for thumbnail generations |
| [ffmpeg](https://www.ffmpeg.org/) | Generating thumbnails for most of the supported media formats |
| [ImageMagick](https://imagemagick.org/index.php/) | Generating thumbnails for HEIC files |
| [libheif](https://github.com/strukturag/libheif.git) | Used together with ImageMagics for HEIC thumbnails |
| [Vue.js](https://vuejs.org/) | GUI |
| [Vuetify](https://vuetifyjs.com/) | Vue UI Library |
| [Koa](https://koajs.com/) | Creating a web server that serves the GUI |

### Support

Feel free to request features and report issues using [the issues page](https://github.com/marmxlab/photos/issues).
Any feedback would be appreciated. Thank you :)

### License

MIT
