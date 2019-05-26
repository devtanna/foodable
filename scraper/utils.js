function slugify(string) {
  const a = 'àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœṕŕßśșțùúüûǘẃẍÿź·/_,:;';
  const b = 'aaaaaaaaceeeeghiiiimnnnoooooprssstuuuuuwxyz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (
    (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength)
  );
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function calculateScore(item) {
  score = 0;
  rating = item['rating'];
  offer = item['offer'];
  offer_map = {
    Special: 10,
    Offer: 10,
    Discount: 5,
    Special: 5,
  };

  // offer is defined - 10 points
  if (offer != undefined) {
    if (offer.trim() != '') {
      score += 10;
    }

    // get number from string
    match = offer.match(/\d+/);
    if (match != null) number = match[0];
    else number = null;

    // extract % offer from offer string
    if (offer.indexOf('%') > -1) {
      if (number != undefined || number != null) {
        // we have a percentage number
        // !! higher is better !!
        score += parseFloat(number);
      }
    } else {
      if (number != undefined || number != null) {
        // we have an amount of discount number
        // !! lower is better !! So subtract from 100 to reflect this.
        score += 100 - parseFloat(number);
      }
    }

    // Add up the string scores
    for (key in offer_map) {
      if (
        offer
          .toString()
          .toLowerCase()
          .indexOf(key.toString().toLowerCase()) != -1
      ) {
        score += offer_map[key];
      }
    }
  }

  // rating is defined - 10 points
  if (rating != undefined) {
    if (rating.trim() != '') {
      score += 10;
    }
    // add the rating
    // get number from string
    match = rating.match(/\d+/);
    if (match != null) number = match[0];
    else number = null;

    if (number != undefined || number != null) {
      score += parseFloat(number);
    }
  }

  return parseFloat(score);
}

module.exports = {
  slugify: slugify,
  stringDistance: similarity,
  calculateScore: calculateScore,
};
