Movie.delete_all

movies = [
  {name: 'The Artist', slug: 'the-artist', url1: 'http://trailers.apple.com/trailers/weinstein/theartist/', url2: 'http://www.imdb.com/title/tt1655442/', director: '', cast: '', synopsis: ''},
  {name: 'The Descendants', slug: 'the-descendants', url1: 'http://trailers.apple.com/trailers/fox_searchlight/thedescendants/', url2: 'http://www.imdb.com/title/tt1033575/', director: '', cast: '', synopsis: ''},
  {name: 'The Help', slug: 'the-help', url1: 'http://trailers.apple.com/trailers/dreamworks/thehelp/', url2: 'http://www.imdb.com/title/tt1454029/', director: '', cast: '', synopsis: ''},
  {name: 'Hugo', slug: 'hugo', url1: 'http://trailers.apple.com/trailers/paramount/hugo/', url2: 'http://www.imdb.com/title/tt0970179/', director: '', cast: '', synopsis: ''},
  {name: 'Moneyball', slug: 'moneyball', url1: 'http://trailers.apple.com/trailers/sony_pictures/moneyball/', url2: 'http://www.imdb.com/title/tt1210166/', director: '', cast: '', synopsis: ''}
]

movies.each {|m| Movie.create!(*[m])}