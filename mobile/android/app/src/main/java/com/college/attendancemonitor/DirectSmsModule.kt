package com.college.attendancemonitor

import android.os.Build
import android.telephony.SmsManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.ArrayList

class DirectSmsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "DirectSms"
    }

    @ReactMethod
    fun sendDirectSms(phoneNumber: String, message: String, promise: Promise) {
        try {
            val smsManager: SmsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                reactApplicationContext.getSystemService(SmsManager::class.java) ?: SmsManager.getDefault()
            } else {
                @Suppress("DEPRECATION")
                SmsManager.getDefault()
            }

            val cleanPhone = phoneNumber.replace("[^0-9+]".toRegex(), "")
            val parts: ArrayList<String> = smsManager.divideMessage(message)

            if (parts.size > 1) {
                smsManager.sendMultipartTextMessage(cleanPhone, null, parts, null, null)
            } else {
                smsManager.sendTextMessage(cleanPhone, null, message, null, null)
            }

            promise.resolve("SMS Sent Successfully to $cleanPhone")
        } catch (e: Exception) {
            promise.reject("SMS_SEND_ERROR", e.localizedMessage ?: "Failed to send SMS", e)
        }
    }

    @ReactMethod
    fun sendTextMessage(phoneNumber: String, message: String, promise: Promise) {
        sendDirectSms(phoneNumber, message, promise)
    }

    @ReactMethod
    fun sendSms(phoneNumber: String, message: String, promise: Promise) {
        sendDirectSms(phoneNumber, message, promise)
    }
}
