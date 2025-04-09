module.exports = function(eleventyConfig) {
  // Add JSON data source
  eleventyConfig.addCollection("photos", function(collection) {
    const photosJson = require("./src/photos.json");
    return photosJson._embedded.items;
  });

  // Add CSS processing
  eleventyConfig.addPassthroughCopy({
    "src/tailwind.css": "tailwind.css",
    "src/styles.css": "styles.css"
  });

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
