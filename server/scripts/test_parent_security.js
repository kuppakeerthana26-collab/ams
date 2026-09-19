
const BASE_URL = "http://localhost:3000";

async function runParentSecurityTests() {
  console.log("=================================================");
  console.log("  GKCE AMS - PARENT HARDWARE BINDING & SECURITY TESTS");
  console.log("=================================================");

  // 1. Health Check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthJson = await healthRes.json();
  console.log("1. Server Health:", healthJson);
  if (healthJson.status !== "ok") throw new Error("Health check failed");

  const parentPhone = "+919876543210";
  const parentDeviceId = "DEV_HARDWARE_PARENT_SAMSUNG_S23";
  const studentAttackerDeviceId = "DEV_HARDWARE_STUDENT_POCO_X5";

  // 2. Request OTP
  console.log("\n2. Requesting OTP for Parent Phone:", parentPhone);
  const otpRes = await fetch(`${BASE_URL}/api/parent/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: parentPhone }),
  });
  const otpJson = await otpRes.json();
  console.log("   Status:", otpRes.status, "| Result:", otpJson.message);
  console.log("   Wards Found:", otpJson.wardsPreview);
  if (otpRes.status !== 200) throw new Error("OTP request failed");

  // 3. First-Time Registration & Device Binding (Legitimate Parent Device)
  console.log("\n3. First-Time Login & Hardware Binding with Parent Device:", parentDeviceId);
  const bindRes = await fetch(`${BASE_URL}/api/parent/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: parentPhone,
      otp: "123456",
      deviceId: parentDeviceId,
      deviceModel: "Samsung Galaxy S23 (Parent Phone)",
    }),
  });
  const bindJson = await bindRes.json();
  console.log("   Status:", bindRes.status);
  console.log("   Parent Bound Data:", bindJson.parent);
  if (bindRes.status !== 200 || !bindJson.token) throw new Error("Initial device binding failed");
  const parentToken = bindJson.token;
  const wardId = bindJson.wards[0].id;

  // 4. SIMULATION: Student tries to login on their own phone using Parent Credentials
  console.log("\n4. [SECURITY TEST] Student attempts unauthorized login from student phone:", studentAttackerDeviceId);
  const attackRes = await fetch(`${BASE_URL}/api/parent/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: parentPhone,
      otp: "123456",
      deviceId: studentAttackerDeviceId,
      deviceModel: "Poco X5 Pro (Student Phone)",
    }),
  });
  const attackJson = await attackRes.json();
  console.log("   Status:", attackRes.status, "(Expected: 403 Forbidden)");
  console.log("   Error Code:", attackJson.errorCode, "(Expected: DEVICE_MISMATCH)");
  console.log("   Alert Message:", attackJson.message);

  if (attackRes.status === 403 && attackJson.errorCode === "DEVICE_MISMATCH") {
    console.log("   >>> SUCCESS: STUDENT ACCESS ATTEMPT REJECTED BY HARDWARE BINDING! <<<");
  } else {
    throw new Error("Security vulnerability: Student device was NOT blocked!");
  }

  // 5. Legitimate Parent Accesses Wards List
  console.log("\n5. Parent requests ward list with valid JWT & Device Signature");
  const wardsRes = await fetch(`${BASE_URL}/api/parent/wards`, {
    headers: {
      Authorization: `Bearer ${parentToken}`,
      "x-device-id": parentDeviceId,
    },
  });
  const wardsJson = await wardsRes.json();
  console.log("   Status:", wardsRes.status);
  console.log("   Wards Retrieved:", wardsJson.wards.map(w => `${w.name} (${w.className})`));
  if (wardsRes.status !== 200) throw new Error("Get wards failed");

  // 6. Parent Accesses Ward Attendance (Weekly, Monthly, % Metrics)
  console.log("\n6. Parent requests complete attendance record for Ward:", wardId);
  const attRes = await fetch(`${BASE_URL}/api/parent/attendance/${wardId}`, {
    headers: {
      Authorization: `Bearer ${parentToken}`,
      "x-device-id": parentDeviceId,
    },
  });
  const attJson = await attRes.json();
  console.log("   Status:", attRes.status);
  console.log("   Ward:", attJson.student.name, "| Class:", attJson.student.className);
  console.log("   Attendance %:", attJson.attendance.percentage + "%", "| Standing:", attJson.attendance.standing);
  console.log("   Weekly Strip (7 Days):", attJson.attendance.weeklyStrip);
  console.log("   Monthly Breakdown:", attJson.attendance.monthlyBreakdown);
  console.log("   Class Faculty Contact:", attJson.contacts.faculty);
  console.log("   Department HOD Contact:", attJson.contacts.hod);
  if (attRes.status !== 200) throw new Error("Get attendance failed");

  console.log("\n=================================================");
  console.log("  ALL PARENT SECURITY & API TESTS PASSED 100%!");
  console.log("=================================================");
}

runParentSecurityTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
