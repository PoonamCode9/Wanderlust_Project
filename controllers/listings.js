const Listing = require("../models/listing.js");
const maptilerClient = require("@maptiler/client");   // for map geocoding
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
    const response = await maptilerClient.geocoding.forward(req.body.listing.location);
    
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing (req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    newListing.geometry = response.features[0].geometry;

    let savedListing = await newListing.save();
    // console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author",}}).populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested for doesn't exist!");
        return res.redirect("/listings");
    }
    // console.log(listing);
    res.render("./listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for doesn't exist!");
        return res.redirect("/listings");
    }

    
    let originalImageUrl = listing.image.url;
    if(originalImageUrl.includes("/upload")) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/e_blur:400/c_scale,h_200,w_300/");
    };
    
    res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing}, { new: true });

    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    const response = await maptilerClient.geocoding.forward(req.body.listing.location, { limit: 1 } );
    if(response.features.length > 0) {
        listing.geometry = response.features[0].geometry;
        await listing.save();
    }
    
    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`);
};

module.exports.distroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings");
};

module.exports.renderCategory = async (req, res) => {
    const { category } = req.params;

    const allListings = await Listing.find({ category: category });
    res.render("./listings/index.ejs", { allListings });
}

module.exports.search = async (req, res) => {
  let { location } = req.query;

  let allListings;

  if(location){
    allListings = await Listing.find({
        $or: [
            { location: { $regex: location, $options: "i" } },
            { country: { $regex: location, $options: "i" } },
            { title: { $regex: location, $options: "i" } },
        ]
    });
  } else {
    allListings = await Listing.find({});
  }

  res.render("./listings/index.ejs", { allListings });
};

