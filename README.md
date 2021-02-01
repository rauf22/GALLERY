 see how it works here: https://rauf22.github.io/GALLERYDIST/  This component of the carousel works on mobile and desktop. 

To install, you need to download, unpack, go to the application directory and run "npm i".

Then run the "gulp".

There is a way to change options at the end of the assets/js/app.js file.

By default they are as shown below:

new Gallery(document.getElementById("gallery"), {
  margin: 10,
  slidesToShow : 1,
  infinity: false,
  currentSlide: 1
});
