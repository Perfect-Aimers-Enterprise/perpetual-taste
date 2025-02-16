const orderModel = require('../model/orderModel')
const nodemailer = require('nodemailer')
const userSchema = require('../model/userModel')

const getAllProceedOrder = async (req, res) => {
    try {
        const orderProceed = await orderModel.find({createdBy: req.user.userId}).sort({ createdAt: -1 })

        res.status(201).json({orderProceed, count: orderProceed.length})
    } catch (error) {
        res.status(500).json(error)
    }
}



const createProceedOrder = async (req, res) => {
    try {
        // Attach the user ID to the order
        req.body.createdBy = req.user.userId;

        // Save the order to the database
        const orderProceed = await orderModel.create({...req.body});

        console.log('Order Created:', orderProceed);
      
        const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.perpetual_Taste_EMAIL,  // Gmail email address
                        pass: process.env.perpetual_Taste_PASSWORD,
                    }
                })
        
                const mailOptions = {
                    from: process.env.perpetual_Taste_EMAIL,
                    to: user.userEmail,
                    subject: `Perpetual Taste - Order #${orderProceed._id} Confirmation`,
                    html: `
                        <table style=" width: 100%; margin: auto;">
                            <tr style="width: 100%; margin: auto;">

                                <td>
                                    <h1 style="font-size: 24px; margin: 0; color: #333; text-align: center;">Thank You for Your Order, ${orderProceed.userName}!</h1>
                                    <p style="text-align: center;">Your order is now being processed. We will notify you once it ships.</p>
                                </td>
                            
                        </tr>
                        </table>
                        <table style="width: 100%; font-family: Arial, sans-serif; color: #333; background-color: #ffffff; padding: 20px; border-collapse: collapse; margin-top: 20px;">
                            <tr>
                                <td style="padding: 10px; background-color: #ddd; font-weight: bold;">Product</td>
                                <td style="padding: 10px;">${orderProceed.menuProductOrderName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; background-color: #ddd; font-weight: bold;">Quantity</td>
                                <td style="padding: 10px;">${orderProceed.menuProductOrderQuantity}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; background-color: #ddd; font-weight: bold;">Price</td>
                                <td style="padding: 10px;">$${orderProceed.menuProductOrderPrice}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; background-color: #ddd; font-weight: bold;">Total Refunded</td>
                                <td style="padding: 10px; font-weight: bold;">$${orderProceed.menuTotalProductOrderPrice}</td>
                            </tr>
                        </table>

                        <p><strong>Total: $${orderProceed.menuTotalProductOrderPrice}</strong></p>

                        <img src="cid:email-image" alt="Order Image" style="width: 300px; height: auto; margin: 20px auto; display: block; ">

                        <p>If you have any questions, feel free to contact our support team at <a href="mailto:support@perpetualtaste.com">support@perpetualtaste.com</a>.</p>

                        <p>Want to order again? <a href="perpetual-taste.onrender.com" style="color: #007bff; font-weight: bold;">Browse our menu</a>.</p>

                        <p>Best regards,</p>
                        <p><strong>Perpetual Taste Team</strong></p>

                    `,
                    attachments: [
                        {
                            filename: orderProceed.menuProductOrderImage, // Image filename
                            path: path.resolve(__dirname, `../public/image/menuImage/${orderProceed.menuProductOrderImage}`),// Image path
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



        res.status(201).json({
            orderProceed,
            message: 'Order Processed Successfully and Notification Sent!'
        });

    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ message: 'Error placing order.', error });
    }
};

const adminGetAllProceedOrder = async (req, res) => {
    try {
        const orderProceed = await orderModel.find({ menuProductOrderStatus: 'Pending' }).sort({ createdAt: -1 })

        res.status(201).json({orderProceed, count: orderProceed.length})
    } catch (error) {
        res.status(500).json(error)
    }
}

const adminGetAllConfirmedOrdersPrice = async (req, res) => {
    try {
        // Fetch all orders with status "Confirmed"
        const confirmedOrders = await orderModel.find({ menuProductOrderStatus: 'Confirmed' }).sort({ createdAt: -1 });

        // Calculate the total price
        const totalConfirmedPrice = confirmedOrders.reduce((total, order) => {
            return total + parseFloat(order.menuTotalProductOrderPrice || 0); // Convert to number and ensure no undefined values
        }, 0);

        // Send the response
        res.status(201).json({
            confirmedOrders,
            count: confirmedOrders.length,
            totalPrice: totalConfirmedPrice
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const adminCancleOrder = async (req, res) => {
    try {

        const {id:orderId} = req.params
        const orderProceed = await orderModel.findOneAndDelete({createdBy: req.user.userId, _id:orderId})

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.perpetual_Taste_EMAIL,
              pass: process.env.perpetual_Taste_PASSWORD,
            }
        })

        const mailOptions = {
            from: process.env.perpetual_Taste_EMAIL,
            to: user.userEmail,
            subject: `Your Order Has Been Canceled as Requested [Order #${orderProceed._id}]`,
            html: `
                <table style="width: 100%; font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 15px; text-align: center;">
                            <h1 style="font-size: 24px; color: #cc0000;">Order Canceled - We're Sorry to See You Go, ${orderProceed.userName}</h1>
                            <p>Your order has been successfully canceled as per your request. If this was a mistake, please contact us as soon as possible.</p>
                        </td>
                    </tr>
                </table>
        
                <table style="width: 100%; font-family: Arial, sans-serif; color: #333; background-color: #ffffff; padding: 20px; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td style="padding: 10px; background-color: #ddd; font-weight: bold;">Product</td>
                        <td style="padding: 10px;">${orderProceed.menuProductOrderName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; background-color: #ddd; font-weight: bold;">Quantity</td>
                        <td style="padding: 10px;">${orderProceed.menuProductOrderQuantity}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; background-color: #ddd; font-weight: bold;">Price</td>
                        <td style="padding: 10px;">$${orderProceed.menuProductOrderPrice}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; background-color: #ddd; font-weight: bold;">Total Refunded</td>
                        <td style="padding: 10px; font-weight: bold;">$${orderProceed.menuTotalProductOrderPrice}</td>
                    </tr>
                </table>
        
                <p style="text-align: center; margin-top: 20px;">If you have any concerns or need assistance, feel free to contact our support team at <a href="mailto:support@perpetualtaste.com">support@perpetualtaste.com</a>.</p>
        
                <p style="text-align: center; margin-top: 10px;">We hope to serve you again in the future!</p>
        
                <p style="text-align: center;"><strong>Perpetual Taste Team</strong></p>
            `,
        };

        await transporter.sendMail(mailOptions)
        
        res.status(201).json({message: 'Item Cancled Successfully'})

    } catch (error) {
        res.status(500).json(error)
    }
}

const adminConfirmOrder = async (req, res) => {
    try {
        const {id:orderId} = req.params
        const orderProceed = await orderModel.findOne({createdBy: req.user.userId, _id:orderId})

        orderProceed.menuProductOrderStatus = 'Confirmed'
        await orderProceed.save()

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.perpetual_Taste_EMAIL,  // Gmail email address
                pass: process.env.perpetual_Taste_PASSWORD,
            }
        })


        const mailOptions = {
            from: process.env.perpetual_Taste_EMAIL,
            to: orderProceed.userEmail,
            subject: `Your Order Has Been Successfully Delivered! [Order #${orderProceed._id}]`,
            html: `
                <table style="width: 100%; font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 15px; text-align: center;">
                            <h1 style="font-size: 24px; color: #333;">Order Delivered - Thank You, ${orderProceed.userName}!</h1>
                            <p>Your Proceed has been successfully delivered. We appreciate your trust in us!</p>
                        </td>
                    </tr>
                </table>

                <table style="width: 100%; font-family: Arial, sans-serif; color: #333; background-color: #ffffff; padding: 20px; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td style="padding: 10px; background-color: #ddd; font-weight: bold;">Product</td>
                        <td style="padding: 10px;">${orderProceed.menuProductOrderName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; background-color: #ddd; font-weight: bold;">Quantity</td>
                        <td style="padding: 10px;">${orderProceed.menuProductOrderQuantity}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; background-color: #ddd; font-weight: bold;">Price</td>
                        <td style="padding: 10px;">$${orderProceed.menuProductOrderPrice}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; background-color: #ddd; font-weight: bold;">Total</td>
                        <td style="padding: 10px; font-weight: bold;">$${orderProceed.menuTotalProductOrderPrice}</td>
                    </tr>
                </table>

                <p style="text-align: center; margin-top: 20px;">We'd love to hear your feedback! Click <a href="[Your Website Link]/feedback" style="color: #007bff; font-weight: bold;">here</a> to rate your experience.</p>

                <p style="text-align: center;">If you have any questions, contact our support team at <a href="mailto:support@perpetualtaste.com">support@perpetualtaste.com</a>.</p>

                <p style="text-align: center; margin-top: 10px;">Looking forward to serving you again!</p>

                <p style="text-align: center;"><strong>Perpetual Taste Team</strong></p>
            `
        }

        await transporter.sendMail(mailOptions)

        res.status(201).json({message: 'Item Confirmed'})
    } catch (error) {
        res.status(500).json(error)
    }
}

const getMonthlyOrders = async (req, res) => {
    const { month, year } = req.query; // e.g., month=1 (January), year=2024
    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // End of the month

        const orders = await orderModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $group: {
                    _id: { $week: "$createdAt" },
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$menuTotalProductOrderPrice" },
                },
            },
            {
                $sort: { "_id": 1 }, // Sort by week
            },
        ]);

        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getWeeklyGrowth = async (req, res) => {
    try {
      const today = new Date();
  
      // Start of current week (Sunday)
      const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      currentWeekStart.setHours(0, 0, 0, 0); // Set to midnight
  
      // Start of previous week (Sunday)
      const previousWeekStart = new Date(currentWeekStart);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  
      // End of previous week (Saturday)
      const previousWeekEnd = new Date(currentWeekStart);
      previousWeekEnd.setSeconds(-1); // Just before the current week starts
  
      // Aggregate orders for the current and previous weeks
      const currentWeekOrders = await orderModel.countDocuments({
        createdAt: { $gte: currentWeekStart },
      });
  
      const previousWeekOrders = await orderModel.countDocuments({
        createdAt: {
          $gte: previousWeekStart,
          $lt: previousWeekEnd,
        },
      });
  
      console.log({
        currentWeekStart,
        previousWeekStart,
        previousWeekEnd,
        currentWeekOrders,
        previousWeekOrders,
      });
  
      // Calculate growth percentage
      let growthPercentage = 0;
      if (previousWeekOrders === 0) {
        growthPercentage = currentWeekOrders > 0 ? 100 : 0; // Assume 100% growth for first-time orders
      } else {
        growthPercentage = ((currentWeekOrders - previousWeekOrders) / previousWeekOrders) * 100;
      }
  
      res.status(200).json({
        currentWeekOrders,
        previousWeekOrders,
        growthPercentage: growthPercentage.toFixed(2), // Limit to two decimal places
      });
    } catch (error) {
      console.error('Error calculating weekly growth:', error);
      res.status(500).json({ error: error.message });
    }
  };
  

module.exports = {createProceedOrder, getAllProceedOrder, adminGetAllProceedOrder, adminCancleOrder, adminConfirmOrder, adminGetAllConfirmedOrdersPrice, getMonthlyOrders, getWeeklyGrowth}