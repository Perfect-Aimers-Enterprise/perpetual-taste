const userSchema = require('../model/userModel')
const nodemailer = require('nodemailer')
const cron = require('node-cron');
const path = require('path')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const registerUser = async (req, res) => {
    try {
        const user = await userSchema.create({ ...req.body })
        const verificationToken = crypto.randomBytes(32).toString('hex')
        const verificationTokenExpires = Date.now() + 360000

        user.verificationToken = verificationToken
        user.verificationTokenExpires = verificationTokenExpires
        user.isVerified = false
        user.pending = true
        
        await user.save()
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.perpetual_Taste_EMAIL,
              pass: process.env.perpetual_Taste_PASSWORD,
            },
            debug: true,
            logger: true,
          });
          

        const verifyEmailUrl = `https://${req.headers.host}/doveeysKitchen/api/verify-email?token=${verificationToken}`;


        const mailOptions = {
            from: process.env.perpetual_Taste_EMAIL,
            to: user.userEmail,
            subject: 'Perpetual Taste Email Verification',
            html: `
                <table style="width: 100%; font-family: Arial, sans-serif; color: #333; text-align: center; background-color: #f9f9f9; padding: 20px;">
                    <tr>
                        <td style="padding: 10px;">
                            <h1 style="font-size: 24px; margin: 0; color: #333;">Verify Your Email</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">
                            <p style="font-size: 16px; margin: 0;">Welcome! Please verify your email to gain access to your Perpetual Taste account.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">
                            <!-- Embedded image -->
                            <img src="cid:email-image" alt="Verification Banner" style="width: 300px; height: auto; border: none; margin: 10px auto;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">
                            <p style="font-size: 14px; margin: 0;">
                                Click <a href="${verifyEmailUrl}" style="font-weight: bold; color: #007bff; text-decoration: none;">here</a> to verify your email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">
                            <p style="font-size: 12px; color: #666; margin: 0;">
                                If you did not request this, please ignore this email or contact our support.
                            </p>
                        </td>
                    </tr>
                </table>
        `,
        attachments: [
            {
                filename: 'logo.png', // Image filename
                path: path.resolve(__dirname, '../public/image/perpetualTasteImg/logo.png'),// Image path
                cid: 'email-image', // Content ID matches img src
            },
        ],
        } 

        await transporter.sendMail(mailOptions)
        
        const token = user.createJwt()
        res.status(201).json({
            user: {
                userName: user.userName,
                userEmail: user.userEmail,
                userPhone: user.userPhone
            },
            token
        })

        
    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            return res.status(400).json({message: "Email already exist, Please try another email"})
        }
        res.status(500).json({error, message: "This wasn't a successful Registration"})
    }
}

const loginUser = async (req, res) => {
    try {
        const {userEmail, userPassword} = req.body
        const user = await userSchema.findOne({userEmail})

        if (!user) {
            return res.status(404).json({ message: 'Invalid credentials (Email does not exist)' });
        }

        const isPasswordMatched = await user.comparePassword(userPassword)

        if (!isPasswordMatched) {
            return res.status(404).json({ message: 'Invalid credentials (Wrong Password)' });
        }

        const token = user.createJwt()
        res.status(201).json({
            user: {
                userName: user.userName,
                userEmail: user.userEmail,
                userPhone: user.userPhone
            },
            token
        })
    } catch (error) {
        res.status(500).json(error)
        console.log(error);
        
    }
}

const getRegisteredUser = async (req, res) => {
    try {
        const user = await userSchema.find()

        res.status(201).json({user, count: user.length})
    } catch (error) {
        res.status(500).json(error)
    }
}

const verifyRegisteredUser = async (req, res) => {
    try {

        const {token} = req.query

        const user = await userSchema.findOne({
            verificationToken: token,
            verificationTokenExpires: {$gt: Date.now()}
        })

        if(!user) {
            res.status(400).json({message: `Token Expired or Not Found.`})
            res.sendFile(path.join(__dirname, '../public/htmlFolder/expiredToken.html'));
        }

        user.verificationToken = undefined
        user.verificationTokenExpires = undefined
        user.isVerified = true
        user.pending = false

        await user.save()

        const mailOptions = {
            from: process.env.perpetual_Taste_EMAIL,
            to: user.userEmail,
            subject: 'Welcome to Perpetual Taste',
            html: `
                <table style="width: 100%; font-family: Arial, sans-serif; color: #333; text-align: center; background-color: #f9f9f9; padding: 20px;">
                    <tr>
                        <td style="padding: 10px;">
                            <h1 style="font-size: 24px; margin: 0; color: #333;">Get ready for a delightful culinary journey!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">
                            <p style="font-size: 16px; margin: 0;">Dear ${user.userName},

                            Thank you for joining the Perpetual Taste's family! 🎉 We’re thrilled to have you on board, and we promise to treat your taste buds to something extraordinary.
                            
                            We pride ourselves on serving freshly prepared meals made with love, passion, and the finest ingredients—because you deserve nothing less!
                            
                            As a token of appreciation, we’ve prepared a special surprise just for you:
                            
                            </p>
                            <p>👉 Get [10%-15% off] your first order!</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">
                            <!-- Embedded image -->
                            <img src="cid:email-image" alt="Verification Banner" style="width: 300px; height: auto; border: none; margin: 10px auto;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">
                            <p style="font-size: 14px; margin: 0;">
                                Click <a href="#" style="font-weight: bold; color: #007bff; text-decoration: none;">here</a> to place your first order.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">
                            <p style="font-size: 12px; color: #666; margin: 0;">
                                If you did not request this, please ignore this email or contact our support.
                            </p>
                        </td>
                    </tr>
                </table>
            `,
            attachments: [
                {
                    filename: 'electrical1.jpg', // Image filename
                    path: path.resolve(__dirname, '../public/image/perpertualTasteImg/bakery8.jpg'),// Image path
                    cid: 'email-image', // Content ID matches img src
                },
            ],
        }

        try {
            await transporter.sendMail(mailOptions);
            console.log("Email sent successfully");
        } catch (emailError) {
            console.error("Nodemailer Error:", emailError);
        }

        res.sendFile(path.join(__dirname, '../public/htmlFolder/VerificationSuccessful.html'));

    } catch (error) {
        
    }
}

const forgottenPassword = async (req, res) => {
    try {
        const { userEmail } = req.body
        const user = await userSchema.findOne({userEmail})
     
        // console.log(req);
        
        // perfectaimersenterprise@gmail.com

        if(!user) {
            return res.status(404).json({message: `No user with email ${userEmail}`})
        }

        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpires = Date.now() + 360000
        
        user.resetToken = resetToken
        user.resetTokenExpires = resetTokenExpires

        await user.save()

        console.log('user', user);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.perpetual_Taste_EMAIL,  // Gmail email address
                pass: process.env.perpetual_Taste_PASSWORD,   // Gmail password or App Password
            },
        })

        const resetUrl = `https://${req.headers.host}/doveeysKitchen/api/reset-password?token=${resetToken}&email=${userEmail}`;

        const mailOptions = {
            from: process.env.perpetual_Taste_EMAIL,
            to: user.userEmail,
            subject: 'Password Recovery',
            html: `
                <table style="width: 100%; font-family: Arial, sans-serif; color: #333; text-align: center; background-color: #f9f9f9; padding: 20px;">
                    <tr>
                        <td style="padding: 10px;">
                            <h1 style="font-size: 24px; margin: 0; color: #333;">Recover Password</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">
                            <p style="font-size: 16px; margin: 0;">Dear ${user.userName},

                            We received your request from Perpetual Taste's family! 🎉 to reset your password.
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 10px;">
                            <p style="font-size: 14px; margin: 0;">
                                Click the button below to proceed <a href="${resetUrl}" style="font-weight: bold; color: #007bff; text-decoration: none;">Reset Password</a>.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">
                            <p style="font-size: 12px; color: #666; margin: 0;">
                                If you did not request this, please ignore this email or contact our support.
                            </p>
                        </td>
                    </tr>
                </table>
            `
        }

        await transporter.sendMail(mailOptions)

        res.status(200).json({user})
    } catch (error) {
        res.status(500).json(error)
    }
}

const resetPassword = async (req, res) => {
    try {
        const { userEmail, token, newPassword } = req.body
        const user = await userSchema.findOne({
            userEmail: userEmail,
            resetToken: token,
            resetTokenExpires: { $gt: Date.now() },
        })

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        user.userPassword = hashedPassword

        user.resetToken = undefined
        user.resetTokenExpires = undefined

        await user.save()
        res.status(200).json({ message: 'Password has been reset successfully' });

    } catch (error) {
        res.status(500).json(error)
    }
}

const requestNewOTP = async (req, res) => {
    try {

        const { userEmail } = req.body

        console.log(userEmail);
        
        const user = await userSchema.findOne({ userEmail })

        console.log(user);
        

        if(!user) {
            res.status(404).json({message: 'No user with such email found'})
        }

        const verificationToken = crypto.randomBytes(32).toString('hex')
        const verificationTokenExpires = Date.now() + 360000

        user.verificationToken = verificationToken
        user.verificationTokenExpires = verificationTokenExpires
        user.isVerified = false
        user.pending = true
        
        await user.save()

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.perpetual_Taste_EMAIL,
              pass: process.env.perpetual_Taste_PASSWORD,
            },
            debug: true,
            logger: true,
          });
          

        const verifyEmailUrl = `https://${req.headers.host}/doveeysKitchen/api/verify-email?token=${verificationToken}`;


        const mailOptions = {
            from: process.env.perpetual_Taste_EMAIL,
            to: user.userEmail,
            subject: 'Perpetual Taste Email Verification',
            html: `
                <table style="width: 100%; font-family: Arial, sans-serif; color: #333; text-align: center; background-color: #f9f9f9; padding: 20px;">
                    <tr>
                        <td style="padding: 10px;">
                            <h1 style="font-size: 24px; margin: 0; color: #333;">Verify Your Email</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">
                            <p style="font-size: 16px; margin: 0;">Welcome! Please verify your email to gain access to your Perpetual Taste account.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">
                            <!-- Embedded image -->
                            <img src="cid:email-image" alt="Verification Banner" style="width: 300px; height: auto; border: none; margin: 10px auto;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">
                            <p style="font-size: 14px; margin: 0;">
                                Click <a href="${verifyEmailUrl}" style="font-weight: bold; color: #007bff; text-decoration: none;">here</a> to verify your email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">
                            <p style="font-size: 12px; color: #666; margin: 0;">
                                If you did not request this, please ignore this email or contact our support.
                            </p>
                        </td>
                    </tr>
                </table>
        `,
        attachments: [
            {
                filename: 'logo.png', // Image filename
                path: path.resolve(__dirname, '../public/image/perpetualTasteImg/logo.png'),// Image path
                cid: 'email-image', // Content ID matches img src
            },
        ],
        } 

        await transporter.sendMail(mailOptions)

        res.status(200).json({message: 'OTP sent successfully 💹'})
    } catch (error) {
        res.status(500).json(error)
    }
}

// Create a transporter using Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.perpetual_Taste_EMAIL,  // Gmail email address
        pass: process.env.perpetual_Taste_PASSWORD,   // Gmail password or App Password
    },
});

// Function to send the reminder email
const sendReminderEmail = async () => {
    try {
        // Fetch users from the database who should receive the email
        const users = await userSchema.find() // Adjust this query to suit your needs (e.g., filtering active users)
        
        users.forEach(user => {
            const mailOptions = {
                from: process.env.DOVEEYS_EMAIL,
                to: user.userEmail,
                subject: 'Reminder: Don\'t Forget to Make Your Weekend Order!',
                html: `
                    <table style="width: 100%; font-family: Arial, sans-serif; color: #333; text-align: center; background-color: #f9f9f9; padding: 20px;">
                        <tr>
                            <td style="padding: 10px;">
                                <h1 style="font-size: 24px; margin: 0; color: #333;">Weekend is Coming! Place Your Order Today!</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;">
                                <p style="font-size: 16px; margin: 0;">Dear ${user.userName},

                                We hope you’ve had a wonderful week so far! 🌟

                                Don’t forget to place your order with Doveey’s Kitchen and treat yourself to some delicious meals this weekend!

                                <br><br> 
                                We’ve got a variety of mouthwatering dishes, prepared just for you! 😋

                                Click <a href="https://doveeys-kitchen.onrender.com/htmlFolder/orderPage.html" style="font-weight: bold; color: #007bff; text-decoration: none;">here</a> to make your weekend order now!
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;">
                                <p style="font-size: 12px; color: #666; margin: 0;">
                                    If you did not request this, please ignore this email or contact our support.
                                </p>
                            </td>
                        </tr>
                    </table>
                `,
            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending reminder email:', error);
                } else {
                    console.log('Reminder email sent to:', user.userEmail);
                }
            });
        });
    } catch (error) {
        console.log('Error fetching users from database:', error);
    }
};

// Schedule the email to send every Friday at 10:00 AM
cron.schedule('0 10 * * 5', sendReminderEmail, {
    scheduled: true,
    timezone: "Africa/Lagos", // Use your local timezone here
});

console.log('Reminder email service is running...');


module.exports = {
    registerUser, loginUser, getRegisteredUser, verifyRegisteredUser, forgottenPassword, resetPassword, requestNewOTP
}