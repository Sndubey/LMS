import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  try {

    if (!process.env.CLERK_WEBHOOK_SECRET) {
      throw new Error('CLERK_WEBHOOK_SECRET is not configured');
    }

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    
    await whook.verify(req.body, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const payload = JSON.parse(req.body.toString());
    const { data, type } = payload;

    switch(type) {
      case 'user.created': {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User',
          imageUrl: data.image_url || data.profile_image_url || '',
        };
        
        await User.create(userData);        
        return res.status(200).json({ success: true, message: 'User created' });
      }

      case 'user.updated': {
        const userData = {
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User',
          imageUrl: data.image_url || data.profile_image_url || '',
        };
        
        await User.findByIdAndUpdate(data.id, userData);        
        return res.status(200).json({ success: true, message: 'User updated' });
      }

      case 'user.deleted': {
        await User.findByIdAndDelete(data.id);
        
        return res.status(200).json({ success: true, message: 'User deleted' });
      }

      default:
        return res.status(200).json({ success: true, message: 'Event acknowledged' });
    }

  } catch (error) {
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};