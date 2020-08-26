var express 	  = require("express"),
    app  		  = express(),
    bodyParser 	  = require("body-parser"),
	mongoose 	  = require("mongoose"),
	passport 	  = require("passport"),
	LocalStrategy = require("passport-local"),
    Campground 	  = require("./models/campground"),
	Comment       = require("./models/comment"),
	User          = require("./models/user"),
	seedDB        = require("./seeds");

mongoose.connect("mongodb://localhost/yelp_camp",{useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
seedDB();

app.use(require("express-session")({
	secret: "Koi is the cutest dog ever!",
	resave: false,
	saveUninitialized: false,
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
	res.render("landing");
});


//INDEX
app.get("/campgrounds", function(req,res){
	Campground.find({}, function(err, allCampgrounds){
		if(err) {
			console.log(err);
		} else {
			res.render("campgrounds/index",{campgrounds: allCampgrounds});
		}
	})
});
//CREATE
app.post("/campgrounds", function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var newCampground = {name: name, image: image, decription: desc}
	Campground.create(newCampground, function(err,newlyCreated){
		if(err){
			console.log(err);
		} else {
			res.redirect("/campgrounds");
		}
	});
	//
});
//NEW
app.get("/campgrounds/new", function(req,res){
	res.render("campgrounds/new");
});
	
app.get("/campgrounds/:id", function(req,res){
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
		if(err){
			console.log(err);
		} else {
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
	
})

app.get("/campgrounds/:id/comments/new", function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		} else {
			res.render("comments/new", {campground: campground});
		}
	})
});

app.post("/campgrounds/:id/comments", function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			Comment.create(req.body.comment, function(err, comment){
				if(err) {
					console.log(err);
				} else {
					campground.comments.push(comment);
					campground.save();
					res.redirect('/campgrounds/' + campground._id);
				}
			});
		}
	})
})

app.get("/register", function(req, res){
	res.render("register");
}); 


app.listen(3000, () => {
	console.log("YelpCamp off!");
});