const express = require("express");
const q2m = require("query-to-mongo");
const ExperienceModel = require("./schema");
const e = require("express");
const multer = require("multer");
const upload = multer({});
const fs = require("fs-extra");
const path = require("path");
const v = require("validator");
const json2csv = require("json2csv").parse;
const { Transform } = require("json2csv");

const pump = require("pump");
const experienceRoute = express.Router();

experienceRoute.post("/:userName/experience", async (req, res) => {
  console.log(req.params.userName);
  const newExperience = new ExperienceModel({
    ...req.body,
    username: req.params.userName,
  });
  console.log(newExperience);
  await newExperience.save();

  res.status(201).send("ok");
});
// experienceRoute.get("/export/csv2/:id", async (req, res, next) => {
//   try {
//     const id = req.params.id;
//     const experience = await ExperienceModel.find({ _id: req.params.id });

//     const jsonReadableStream = fs.createReadStream(experience.toString());

//     const json2csv = new Transform({
//       fields: [
//         "_id",
//         "role",
//         "company",
//         "startDate",
//         "endDate",
//         "description",
//         "area",
//         "username",
//         "createdAt",
//         "updatedAt",
//       ],
//     });

//     res.setHeader("Content-Disposition", "attachment; filename=export.csv");
//     pump(jsonReadableStream, json2csv, res, (err) => {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log("Done");
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });
experienceRoute.get("/export/csv/:userName", async (req, res, next) => {
  // try {

  const id = req.params.id;
  const experience = await ExperienceModel.find({
    username: req.params.userName,
  });

  const fields = [
    "_id",
    "role",
    "company",
    "startDate",
    "endDate",
    "description",
    "area",
    "username",
    "createdAt",
    "updatedAt",
  ];
  const data = { fields };
  const csvString = json2csv(experience, data);
  res.setHeader(
    "Content-disposition",
    "attachment; filename=shifts-report.csv"
  );
  res.set("Content-Type", "text/csv");
  res.status(200).send(csvString);
});

experienceRoute.get("/:userName/experience", async (req, res) => {
  try {
    const experience = await ExperienceModel.find({
      username: req.params.userName,
    });

    res.send(experience);
  } catch (error) {
    console.log(error);
  }
});

experienceRoute.get("/:userName/experience/:id", async (req, res) => {
  try {
    const experience = await ExperienceModel.find({
      username: req.params.userName,
      _id: req.params.id,
    });

    res.send(experience);
  } catch (error) {
    console.log(error);
  }
});

experienceRoute.put("/:userName/experience/:id", async (req, res) => {
  const id = req.params.id;
  const experience = await ExperienceModel.findOneAndUpdate(
    { username: req.params.userName, _id: req.params.id },
    {
      ...req.body,
    },
    { runValidators: true }
  );
  if (experience) {
    res.send("UPDATED");
  }
});

experienceRoute.delete("/:userName/experience/:id", async (req, res) => {
  try {
    await ExperienceModel.findOneAndDelete({
      _id: req.params.id,
      username: req.params.userName,
    });
    res.send("deleted");
  } catch (error) {
    console.log(error);
  }
});
experienceRoute.post(
  "/:userName/experience/:id/image",
  upload.single("image"),
  async (req, res) => {
    const imagesPath = path.join(__dirname, "/images");
    await fs.writeFile(
      path.join(
        imagesPath,
        req.params.id + "." + req.file.originalname.split(".").pop()
      ),
      req.file.buffer
    );

    //
    var obj = {
      image: fs.readFileSync(
        path.join(
          __dirname +
            "/images/" +
            req.params.id +
            "." +
            req.file.originalname.split(".").pop()
        )
      ),
    };

    const experience = await ExperienceModel.findOneAndUpdate(
      {
        $and: [{ _id: req.params.id }, { username: req.params.userName }],
      },
      {
        ...obj,
      },
      { new: true }
    );

    res.send("IMAGE UPLOADED");
  }
);

experienceRoute.post("");
module.exports = experienceRoute;
