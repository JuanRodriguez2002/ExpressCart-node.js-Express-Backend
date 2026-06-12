import jwt from 'jsonwebtoken'
import { generateToken } from './token'
import env from 'dotenv'

env.config()

export const generateJWT = (id: string) : string => {
   const token = jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: '30d' })
   return token
}



