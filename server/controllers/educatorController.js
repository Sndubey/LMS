import {clerkClient} from '@clerk/express'

//updating role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        
        if (!userId) {
            return res.status(401).json({
                success: false, 
                message: 'Unauthorized - No valid session found'
            });
        }

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator'
            }
        })

        res.json({success: true, message: 'you can publish a course now'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}