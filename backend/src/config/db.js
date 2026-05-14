import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`)
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Retrying...')
  })
}

export default mongoose
