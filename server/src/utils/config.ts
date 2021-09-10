import * as dotenv from 'dotenv';

dotenv.config();

export const CLIENT_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://edfhr.org'
    : 'http://localhost:3001';

const mongo_uri =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGO_URI
    : 'mongodb://localhost/nest-dev';

const config = {
  MONGO_URI: process.env.MONGO_URI || mongo_uri,
  V2_MONGO_URI: process.env.V2_MONGO_URI || '',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SECRET: process.env.SECRET || 'kkkjdnsdlkdslkm',
  CLOUDINARY_KEY: process.env.CLOUDINARY_KEY,
  CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
  CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,
  TOKEN_NAME: process.env.TOKEN_NAME || '__ed',
  REDIS_URI: process.env.REDIS_URI,

  DOMAIN_NAME: process.env.DOMAIN_NAME || 'edfhr.org',
  mailInfo: {
    from: {
      email: process.env.SENDER_EMAIL,
      name: process.env.SENDER_NAME,
    },
  },
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID || '',
};

export const mongooseOption = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};
export default config;
