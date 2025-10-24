import { Webhook } from "svix"
import User from "../models/User.js"

export const clerkWebhooks = async (req, res) => {
  try {
    console.log('Webhook headers:', req.headers);
    console.log('Raw body length:', req.body?.length);

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // req.body should be a Buffer here
    await whook.verify(req.body, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const payload = JSON.parse(req.body.toString());
    const { data, type } = payload;

    switch(type){
      case 'user.created': {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          imageUrl: data.image_url || data.profile_image_url,
        };
        console.log("Creating user:", userData);
        await User.create(userData);
        return res.status(200).json({});
      }

      case 'user.updated': {
        const userData = {
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          imageUrl: data.image_url || data.profile_image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        return res.status(200).json({});
      }

      case 'user.deleted': {
        console.log('Deleting user id:', data.id);
        await User.findByIdAndDelete(data.id);
        return res.status(200).json({});
      }

      default:
        return res.status(200).json({}); // acknowledge unknown events
    }

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}