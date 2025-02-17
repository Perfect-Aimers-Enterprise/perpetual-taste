const LoungeBookingUser = require('../model/bookLoungeModel')
const nodemailer = require('nodemailer')

const executeLoungeBooking = async (req, res) => {

    try {
        const executeBooking = await LoungeBookingUser.create({
            ...req.body
        })


        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.perpetual_Taste_EMAIL,  // Gmail email address
                pass: process.env.perpetual_Taste_PASSWORD,
            }
        })

        const mailOptions = {
            from: process.env.perpetual_Taste_EMAIL,
            to: executeBooking.userBookingMail, // Ensure the contact email is provided
            subject: `Booking Confirmation - ${executeBooking.eventName}`,
            html: `
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; color: #333;">
                <div style="max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); margin: auto;">
                    <div style="background-color: #ff6b00; padding: 15px; color: #fff; text-align: center; font-size: 18px; font-weight: bold; border-radius: 8px 8px 0 0;">
                        Lounge Booking Confirmation
                    </div>
                    <div style="padding: 20px; font-size: 16px; line-height: 1.6;">
                        <p>Dear ${executeBooking.userBookingName},</p>
                        <p>Thank you for booking a lounge with us. Below are your booking details:</p>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
                            <p><strong>Event Name:</strong> ${executeBooking.eventName}</p>
                            <p><strong>Event Type:</strong> ${executeBooking.eventType}</p>
                            <p><strong>Lounge Type:</strong> ${executeBooking.loungeType}</p>
                            <p><strong>Number of Guests:</strong> ${executeBooking.numberOfGuest}</p>
                            <p><strong>Event Date:</strong> ${executeBooking.eventDate}</p>
                            <p><strong>Event Time:</strong> ${executeBooking.eventTime}</p>
                            <p><strong>Booking Contact:</strong> ${executeBooking.bookingContact}</p>
                            <p><strong>Additional Request:</strong> ${executeBooking.eventMessage || "No additional requests"}</p>
                        </div>
    
                        <p>We look forward to hosting your event! If you have any questions, feel free to contact us.</p>
    
                        <p style="text-align: center; margin-top: 20px;">
                            <a href="mailto:support@example.com" style="display: inline-block; padding: 10px 20px; background-color: #ff6b00; color: #fff; text-decoration: none; border-radius: 5px;">
                                Contact Support
                            </a>
                        </p>
                    </div>
                    <div style="text-align: center; font-size: 14px; color: #666; margin-top: 20px;">
                        &copy; ${new Date().getFullYear()} Lounge Booking | All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            `
        };

        await transporter.sendMail(mailOptions)

        res.status(201).json({executeBooking, message: 'Booked Successfully'})
    } catch (error) {
        res.status(500).json(error)
    }
}

const getUserBookedLounge = async (req, res) => {
    try {
        const getLoungeBookings = await LoungeBookingUser.find()

        res.status(201).json({getLoungeBookings})
    } catch (error) {
        res.status(500).json(error)   
    }
}

module.exports = { executeLoungeBooking, getUserBookedLounge }