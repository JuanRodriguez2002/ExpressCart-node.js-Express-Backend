import type { Request, Response } from 'express'
import { User } from '../models/User'
import { checkPassword, hashPassword } from '../utils/auth'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'
import { generateJWT } from '../utils/jwt'


export class AuthController {

    static createAccount = async (req: Request, res: Response) => {

        const { email, name, password, role } = req.body

        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
            const error = new Error('Email already in use')
            return res.status(409).json({ error: error.message })
        }

        try {
            const user = new User()
            user.email = email
            user.name = name
            user.role = role || 'client'
            user.password = await hashPassword(password)
            user.token = generateToken()
            await user.save()

           try {
                await AuthEmail.sendConfirmationEmail({
                    name: user.name,
                    email: user.email,
                    token: user.token
                })
            } catch (emailError) {
                // Si el SMTP falla, se registra en los logs de Railway pero NO congela la app
                console.error('⚠️ Error al enviar email de confirmación:', emailError)
            }


            res.status(201).json('Account created successfully' )
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create account' })
        }
    }
    static createAccountSupermarket = async (req: Request, res: Response) => {

        const { email, name, password } = req.body

        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
            const error = new Error('Email already in use')
            return res.status(409).json({ error: error.message })
        }

        try {
            const user = new User()
            user.email = email
            user.name = name
            user.password = await hashPassword(password)
            user.token = generateToken()
            user.role = "supermarket_admin"
            await user.save()

            await AuthEmail.sendSupermarketConfirmationEmail({
                name: user.name,
                email: user.email,
                token: user.token
            })


            res.status(201).json('Account created successfully' )
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create account' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        const { token } = req.body


        const user = await User.findOne({ where: { token } })
        if (!user) {
            const error = new Error('Invalid token')
            return res.status(401).json({ error: error.message })
        }

        user.confirmed = true
        user.token = ''
        await user.save()

        res.status(200).json( 'Account confirmed successfully' )
    }

    static login = async (req: Request, res: Response) => {
        const { email } = req.body

        // Find the user by email
        const user = await User.findOne({ where: { email } })
        if (!user) {
            const error = new Error('user not found')
            return res.status(404).json({ error: error.message })
        }

        if (!user.confirmed) {
            const error = new Error('Account not confirmed')
            return res.status(403).json({ error: error.message })
        }

        const isMatch = await checkPassword(req.body.password, user.password)

        if (!isMatch) {
            const error = new Error('Invalid password')
            return res.status(401).json({ error: error.message })
        }

        const token = generateJWT(user.id)


        res.json({ token })
    }

    static forgotPassword = async (req: Request, res: Response) => {
        const { email } = req.body

        // Find the user by email
        const user = await User.findOne({ where: { email } })
        if (!user) {
            const error = new Error('user not found')
            return res.status(404).json({ error: error.message })
        }

        user.token = generateToken()

        await user.save()

        await AuthEmail.sendForgotPasswordEmail({
            name: user.name,
            email: user.email,
            token: user.token
        })

        res.status(200).json('Password reset instructions sent to your email' )
    }

    static validateToken = async (req: Request, res: Response) => {
        const { token } = req.body

        const user = await User.findOne({ where: { token } })
        if (!user) {
            const error = new Error('Invalid token')
            return res.status(404).json({ error: error.message })
        }

        res.status(200).json('Token is valid')
    }

    static resetPasswordWithToken = async (req: Request, res: Response) => {

        const { token } = req.params
        const { password } = req.body

        const user = await User.findOne({ where: { token } })
        if (!user) {
            const error = new Error('Invalid token')
            return res.status(404).json({ error: error.message })
        }

        user.password = await hashPassword(password)
        user.token = ''
        await user.save()

        res.status(200).json('Password reset successfully')
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user)
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body
        const { id } = req.user

        const user = await User.findByPk(id)

        const isPasswordCorrect = await checkPassword(current_password, user.password)

        if (!isPasswordCorrect) {
            const error = new Error('Current password is incorrect')
            return res.status(401).json({ error: error.message })
        }
        
        user.password = await hashPassword(password)
        await user.save()

        res.status(200).json('Password updated successfully')
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body
        const { id } = req.user

        const user = await User.findByPk(id)

        const isPasswordCorrect = await checkPassword(password, user.password)

        if (!isPasswordCorrect) {
            const error = new Error('Password is incorrect')
            return res.status(401).json({ error: error.message })
        }

        res.status(200).json('Password is correct')
    }

}