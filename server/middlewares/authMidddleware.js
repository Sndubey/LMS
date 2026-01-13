// the userId is usually fetched from token directly (no db lookup), here which is fetched from clerk in client-side in AppContext.jsx file, where in manual login its been created by backend using JWT and send to client, 
// and we can also fetch userId through session (where sessionId is used to look db and find userId of that sessionId).

import { clerkClient } from "@clerk/express";

export const protectEducator = async (req, res, next) => {
    
    try{
        const userId = req.auth.userId;
        const response = await clerkClient.users.getUser(userId);  //here we stored educator role data in clerk only not in db. therfore gettng from clerk.
        
        if(response.publicMetadata.role !== 'educator'){
            return res.json({seccess:false, message: 'unauthorized access'})
        }
        next();

    } catch (error) {
        res.json({success:false, message: error.message})
    }
}