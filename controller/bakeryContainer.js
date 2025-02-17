const Bakery = require('../model/bakeryModel')

const requestBakery = async (req, res) => {
    try {
        const bakeryVar = await Bakery.create({...req.body})
        res.status(201).json(bakeryVar)

        
                const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: process.env.perpetual_Taste_EMAIL,  // Gmail email address
                                pass: process.env.perpetual_Taste_PASSWORD,
                            }
                        })
                
                        const mailOptions = {
                            from: process.env.perpetual_Taste_EMAIL,
                            to: bakeryVar.userOrderEmail,
                            subject: `Perpetual Taste - Bakery Order #${bakeryVar._id} Confirmation`,
                            html: `
                                <table style=" width: 100%; margin: auto;">
                                    <tr style="width: 100%; margin: auto;">
        
                                        <td>
                                            <h1 style="font-size: 24px; margin: 0; color: #333; text-align: center;">Thank You for Your Order, ${bakeryVar.userOrderName}!</h1>
                                            <p style="text-align: center;">Your order is now being processed. We will notify you once it ships.</p>
                                        </td>
                                    
                                </tr>
                                </table>
                                <table style="width: 100%; font-family: Arial, sans-serif; color: #333; background-color: #ffffff; padding: 20px; border-collapse: collapse; margin-top: 20px;">
                                    <tr>
                                        <td style="padding: 10px; background-color: #ddd; font-weight: bold;">Product</td>
                                        <td style="padding: 10px;">${bakeryVar.bakeType} ${bakeryVar.otherBakeType}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; background-color: #ddd; font-weight: bold;">Quantity</td>
                                        <td style="padding: 10px;">${bakeryVar.bakeQuantity}</td>
                                    </tr>
    
                                </table>
        
                                <p><strong>Description: $${bakeryVar.bakeDescription}</strong></p>
        
                                <img src="cid:email-image" alt="Order Image" style="width: 300px; height: auto; margin: 20px auto; display: block; ">
        
                                <p>If you have any questions, feel free to contact our support team at <a href="mailto:support@perpetualtaste.com">support@perpetualtaste.com</a>.</p>
        
                                <p>Want to order again? <a href="perpetual-taste.onrender.com" style="color: #007bff; font-weight: bold;">Browse our menu</a>.</p>
        
                                <p>Best regards,</p>
                                <p><strong>Perpetual Taste Team</strong></p>
        
                            `,
                            attachments: [
                                {
                                    filename: bakeryVar.menuProductOrderImage, // Image filename
                                    path: path.resolve(__dirname, `../public/image/perpetualTasteImg/bakery10.jpg`),// Image path
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
    } catch (error) {
        res.status(500).json(error)
    }
}

const getAllBakery = async (req, res) => {
    try {
        const getBakeryVar = await Bakery.find().sort({ createdAt: -1 })
        res.status(200).json(getBakeryVar)
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports = { requestBakery, getAllBakery }