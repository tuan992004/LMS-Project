const jwt = require('jsonwebtoken')
const User = require('../modules/User.js')

const protectedRoute = (req, res, next) => {
    try {
        //Lấy accessToken từ header
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(" ")[1]

        if (!token){
            return res.status(401).json({message: 'Không tìm thấy access token!'})
        }

        //Xác nhận Token hợp lệ
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
            if(err){
                return res.status(403).json({message: 'Access Token hết hạn hoặc không đúng!'})
            }
            
            //Tìm user
            const user = await User.findById(decodedUser.userid);

            if (!user){
                return res.status(404).json({message: 'Người dùng không tồn tại!'})
            }

            delete user.password;

             //Trả user về req
             req.user = user
             next();
        } )


    } catch (error) {
        console.error('Lỗi khi xác minh JWT trong Middleware', error)
        return res.status(500).json({message: 'Lỗi hệ thống'})
    }
};

module.exports = protectedRoute