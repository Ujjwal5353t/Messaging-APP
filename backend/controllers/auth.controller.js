export const registeruser = async function(req, res) {
    const existing = await addUser(req.body);
    
}