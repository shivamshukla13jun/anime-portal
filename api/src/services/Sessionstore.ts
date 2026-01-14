// === Custom MongoDB Session Store ===
import Session,{ISession} from 'models/session.model';
import { Store } from 'express-session';
import session from 'express-session';
import config from "config";
class CustomMongoStore extends Store {
    constructor() {
      super();
    }
    // Get session from MongoDB
    get(sid: string, callback: (err?: any, session?: session.SessionData | null) => void): void {
      Session.findById(sid)
        .then((doc) => {
          if (!doc || doc.expires < new Date()) {
            return callback(null, null);
          }
          // Ensure the session object has a 'cookie' property
          if (!doc.session.cookie) {
            doc.session.cookie = {};
          }
          
          callback(null, doc.session as session.SessionData);
        })
        .catch(callback);
    }
    // Save session to MongoDB
    set(sid: string, session: session.SessionData, callback?: (err?: any) => void): void {
      const expires = new Date(Date.now() + (config.sessionExpireTime)); // 15 days
  
      Session.findByIdAndUpdate(
        sid,
        {
          _id: sid,
          expires,
          session
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      )
        .then(() => callback?.())
        .catch(callback);
    }
    // Remove session from MongoDB
    destroy(sid: string, callback?: (err?: any) => void): void {
      Session.findByIdAndDelete(sid)
        .then(() => callback?.())
        .catch(callback);
    }
    // Touch session (update expiry)
   touch(sid: string, session: session.SessionData, callback?: (err?: any) => void): void {
      // Get current session expiry from the cookie
      const currentExpiry = session.cookie.expires;
      
      if (currentExpiry) {
        const now = Date.now();
        const expiryTime = new Date(currentExpiry).getTime();
        const timeRemaining = expiryTime - now;
        const threshold = config.sessionExpireTime * 0.2; // Update only if less than 20% time remaining
        
        // Skip DB update if session still has plenty of time left
        if (timeRemaining > threshold) {
          return callback?.();
        }
      }
      
      // Update expiry in DB only when necessary
      const expires = new Date(Date.now() + config.sessionExpireTime);
  
      Session.findByIdAndUpdate(
        sid,
        { expires },
        { new: true }
      )
        .then(() => callback?.())
        .catch(callback);
    }
  }
  
  // === Session Store ===
  const sessionStore = new CustomMongoStore();

  export  default sessionStore;