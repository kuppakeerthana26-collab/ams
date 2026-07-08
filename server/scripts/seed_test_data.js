import mongoose from "mongoose";
import connectDb from "../src/config/database.js";
import Student from "../src/models/Student.js";
import Teacher from "../src/models/Teacher.js";
import Hod from "../src/models/Hod.js";

const studentsData = [
  {
    "rollNo": "23CSE001",
    "name": "Arjun Reddy",
    "className": "CSE_2_A",
    "parentPhone": "9876500001",
    "isActive": true
  },
  {
    "rollNo": "23CSE002",
    "name": "Sai Kiran",
    "className": "CSE_2_A",
    "parentPhone": "9876500002",
    "isActive": true
  },
  {
    "rollNo": "23CSE003",
    "name": "Rahul Varma",
    "className": "CSE_2_A",
    "parentPhone": "9876500003",
    "isActive": true
  },
  {
    "rollNo": "23CSE004",
    "name": "Vijay Kumar",
    "className": "CSE_2_A",
    "parentPhone": "9876500004",
    "isActive": true
  },
  {
    "rollNo": "23CSE005",
    "name": "Karthik Rao",
    "className": "CSE_2_A",
    "parentPhone": "9876500005",
    "isActive": true
  },
  {
    "rollNo": "23CSE006",
    "name": "Naveen Kumar",
    "className": "CSE_2_A",
    "parentPhone": "9876500006",
    "isActive": true
  },
  {
    "rollNo": "23CSE007",
    "name": "Rohit Sharma",
    "className": "CSE_2_A",
    "parentPhone": "9876500007",
    "isActive": true
  },
  {
    "rollNo": "23CSE008",
    "name": "Praveen Reddy",
    "className": "CSE_2_A",
    "parentPhone": "9876500008",
    "isActive": true
  },
  {
    "rollNo": "23CSE009",
    "name": "Aditya Raj",
    "className": "CSE_2_A",
    "parentPhone": "9876500009",
    "isActive": true
  },
  {
    "rollNo": "23CSE010",
    "name": "Sandeep Kumar",
    "className": "CSE_2_A",
    "parentPhone": "9876500010",
    "isActive": true
  },
  {
    "rollNo": "23CSE011",
    "name": "Harsha Vardhan",
    "className": "CSE_2_A",
    "parentPhone": "9876500011",
    "isActive": true
  },
  {
    "rollNo": "23CSE012",
    "name": "Manoj Kumar",
    "className": "CSE_2_A",
    "parentPhone": "9876500012",
    "isActive": true
  },
  {
    "rollNo": "23CSE013",
    "name": "Surya Teja",
    "className": "CSE_2_A",
    "parentPhone": "9876500013",
    "isActive": true
  },
  {
    "rollNo": "23CSE014",
    "name": "Abhinav Reddy",
    "className": "CSE_2_A",
    "parentPhone": "9876500014",
    "isActive": true
  },
  {
    "rollNo": "23CSE015",
    "name": "Pavan Kalyan",
    "className": "CSE_2_A",
    "parentPhone": "9876500015",
    "isActive": true
  },
  {
    "rollNo": "23CSE016",
    "name": "Deepak Kumar",
    "className": "CSE_2_A",
    "parentPhone": "9876500016",
    "isActive": true
  },
  {
    "rollNo": "23CSE017",
    "name": "Ajay Varma",
    "className": "CSE_2_A",
    "parentPhone": "9876500017",
    "isActive": true
  },
  {
    "rollNo": "23CSE018",
    "name": "Tarun Reddy",
    "className": "CSE_2_A",
    "parentPhone": "9876500018",
    "isActive": true
  },
  {
    "rollNo": "23CSE019",
    "name": "Nikhil Raj",
    "className": "CSE_2_A",
    "parentPhone": "9876500019",
    "isActive": true
  },
  {
    "rollNo": "23CSE020",
    "name": "Vamsi Krishna",
    "className": "CSE_2_A",
    "parentPhone": "9876500020",
    "isActive": true
  },
  {
    "rollNo": "23CSE021",
    "name": "Ananya Reddy",
    "className": "CSE_2_A",
    "parentPhone": "9876500021",
    "isActive": true
  },
  {
    "rollNo": "23CSE022",
    "name": "Sneha Rao",
    "className": "CSE_2_A",
    "parentPhone": "9876500022",
    "isActive": true
  },
  {
    "rollNo": "23CSE023",
    "name": "Priya Sharma",
    "className": "CSE_2_A",
    "parentPhone": "9876500023",
    "isActive": true
  },
  {
    "rollNo": "23CSE024",
    "name": "Keerthana Reddy",
    "className": "CSE_2_A",
    "parentPhone": "9876500024",
    "isActive": true
  },
  {
    "rollNo": "23CSE025",
    "name": "Divya Sri",
    "className": "CSE_2_A",
    "parentPhone": "9876500025",
    "isActive": true
  },
  {
    "rollNo": "23CSE026",
    "name": "Meghana Rao",
    "className": "CSE_2_A",
    "parentPhone": "9876500026",
    "isActive": true
  },
  {
    "rollNo": "23CSE027",
    "name": "Bhavana Reddy",
    "className": "CSE_2_A",
    "parentPhone": "9876500027",
    "isActive": true
  },
  {
    "rollNo": "23CSE028",
    "name": "Sravani Kumar",
    "className": "CSE_2_A",
    "parentPhone": "9876500028",
    "isActive": true
  },
  {
    "rollNo": "23CSE029",
    "name": "Pooja Varma",
    "className": "CSE_2_A",
    "parentPhone": "9876500029",
    "isActive": true
  },
  {
    "rollNo": "23CSE030",
    "name": "Nandini Rao",
    "className": "CSE_2_A",
    "parentPhone": "9876500030",
    "isActive": true
  },
  {
    "rollNo": "23CSE031",
    "name": "Akhil Reddy",
    "className": "CSE_2_A",
    "parentPhone": "9876500031",
    "isActive": true
  },
  {
    "rollNo": "23CSE032",
    "name": "Siddharth Rao",
    "className": "CSE_2_A",
    "parentPhone": "9876500032",
    "isActive": true
  },
  {
    "rollNo": "23CSE033",
    "name": "Lokesh Kumar",
    "className": "CSE_2_A",
    "parentPhone": "9876500033",
    "isActive": true
  },
  {
    "rollNo": "23CSE034",
    "name": "Ganesh Reddy",
    "className": "CSE_2_A",
    "parentPhone": "9876500034",
    "isActive": true
  },
  {
    "rollNo": "23CSE035",
    "name": "Rakesh Varma",
    "className": "CSE_2_A",
    "parentPhone": "9876500035",
    "isActive": true
  },
  {
    "rollNo": "23CSE036",
    "name": "Teja Kumar",
    "className": "CSE_2_A",
    "parentPhone": "9876500036",
    "isActive": true
  },
  {
    "rollNo": "23CSE037",
    "name": "Madhav Reddy",
    "className": "CSE_2_A",
    "parentPhone": "9876500037",
    "isActive": true
  },
  {
    "rollNo": "23CSE038",
    "name": "Chaitanya Rao",
    "className": "CSE_2_A",
    "parentPhone": "9876500038",
    "isActive": true
  },
  {
    "rollNo": "23CSE039",
    "name": "Yashwanth Kumar",
    "className": "CSE_2_A",
    "parentPhone": "9876500039",
    "isActive": true
  },
  {
    "rollNo": "23CSE040",
    "name": "Kiran Reddy",
    "className": "CSE_2_A",
    "parentPhone": "9876500040",
    "isActive": true
  },
  {
    "rollNo": "23CSE041",
    "name": "Aishwarya Rao",
    "className": "CSE_2_A",
    "parentPhone": "9876500041",
    "isActive": true
  },
  {
    "rollNo": "23CSE042",
    "name": "Lakshmi Priya",
    "className": "CSE_2_A",
    "parentPhone": "9876500042",
    "isActive": true
  },
  {
    "rollNo": "23CSE043",
    "name": "Harini Reddy",
    "className": "CSE_2_A",
    "parentPhone": "9876500043",
    "isActive": true
  },
  {
    "rollNo": "23CSE044",
    "name": "Swathi Rao",
    "className": "CSE_2_A",
    "parentPhone": "9876500044",
    "isActive": true
  },
  {
    "rollNo": "23CSE045",
    "name": "Kavya Sri",
    "className": "CSE_2_A",
    "parentPhone": "9876500045",
    "isActive": true
  },
  {
    "rollNo": "23CSE046",
    "name": "Mounika Reddy",
    "className": "CSE_2_A",
    "parentPhone": "9876500046",
    "isActive": true
  },
  {
    "rollNo": "23CSE047",
    "name": "Sindhu Priya",
    "className": "CSE_2_A",
    "parentPhone": "9876500047",
    "isActive": true
  },
  {
    "rollNo": "23CSE048",
    "name": "Ramya Krishna",
    "className": "CSE_2_A",
    "parentPhone": "9876500048",
    "isActive": true
  },
  {
    "rollNo": "23CSE049",
    "name": "Gayathri Rao",
    "className": "CSE_2_A",
    "parentPhone": "9876500049",
    "isActive": true
  },
  {
    "rollNo": "23CSE050",
    "name": "Anjali Reddy",
    "className": "CSE_2_A",
    "parentPhone": "9876500050",
    "isActive": true
  }
];

const seedTestData = async () => {
  await connectDb();

  console.log("Cleaning and seeding students for class CSE_2_A...");
  // Delete existing students in class CSE_2_A
  await Student.deleteMany({ className: "CSE_2_A" });
  
  // Insert the 50 students
  const createdStudents = await Student.insertMany(studentsData);
  console.log(`Successfully seeded ${createdStudents.length} students.`);

  console.log("Seeding class teacher...");
  const teacherEmail = "teacher.cse2a@college.test";
  // Delete existing class teacher if exists by email or by assignedClass to avoid duplicate key index error
  await Teacher.deleteMany({
    $or: [
      { email: teacherEmail },
      { 
        "assignedClass.branch": "CSE", 
        "assignedClass.year": 2, 
        "assignedClass.section": "A" 
      }
    ]
  });
  
  const createdTeacher = await Teacher.create({
    name: "K. Lakshmi",
    email: teacherEmail,
    password: "Teacher@12345",
    role: "teacher",
    assignedClass: {
      branch: "CSE",
      year: 2,
      section: "A"
    },
    isActive: true
  });
  console.log(`Successfully seeded class teacher: ${createdTeacher.name} (${createdTeacher.email})`);

  console.log("Seeding HOD...");
  const hodEmail = "hod.cse@college.test";
  // Delete existing HOD if exists
  await Hod.deleteMany({ email: hodEmail });

  const createdHod = await Hod.create({
    name: "Dr. R. Prasad",
    email: hodEmail,
    password: "Hod@12345",
    department: "CSE",
    role: "hod",
    isActive: true
  });
  console.log(`Successfully seeded HOD: ${createdHod.name} (${createdHod.email})`);
};

seedTestData()
  .then(() => {
    console.log("Test data seeding completed successfully.");
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  });
