module.exports = function(eleventyConfig) {
  // Add JSON data source
  eleventyConfig.addCollection("photos", function(collection) {
    const photosJson = require("./src/photos.json");
    return photosJson.posts;
  });

  // Add global data
  eleventyConfig.addGlobalData("eleventyData", () => ({
    collection: {
      photos: require("./src/photos.json").posts
    }
  }));

  // Add CSS processing
  eleventyConfig.addPassthroughCopy({
    "src/tailwind.css": "tailwind.css",
    "src/styles.css": "styles.css"
  });

  // Add JS passthrough
  eleventyConfig.addPassthroughCopy({
    "src/scripts": "scripts"
  });

  // Add JSON passthrough
  eleventyConfig.addPassthroughCopy({
    "src/photos.json": "photos.json"
  });

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
