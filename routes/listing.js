const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const { isOwner, validateListing} = require("../middleware.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single("listing[image]"), validateListing,  wrapAsync(listingController.createListing));

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Search Route 
router.get("/search", wrapAsync(listingController.search));

router.route("/:id")
    .get(wrapAsync(listingController.showListing) )
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing) )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.distroyListing) );


// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm) );

// Category Route
router.get("/category/:category", wrapAsync(listingController.renderCategory));


module.exports = router;

