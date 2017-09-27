# Pdflayer

Any-Promise oriented Wrapper for [pdflayer](https://pdflayer.com) API

### Installing

```javascript
npm install pdflayer
```

### Usage

```javascript

// Example with Express and Bluebird as promise library.

require('any-promise/register/bluebird'); //Registering Bluebird as my preferred Promise library. If not done will go native.

const PdfLayer = require('pdflayer');
const pdfLayer = new PdfLayer({
	apiKey: 'YOUR API KEY'
});
const express = require('express');
const app = express();
// 
app.get('/raw-html.pdf', function(req, res){
	pdfLayer.generate('<div>This Is A Raw Html... and Hello World!</div>', {
		page_size: 'A3' //This is an option object. Follow https://pdflayer.com/documentation for more infos.
	}).then(function(pdfResponse){
		// You can stream the response to an html res object like this;
		res.pipe(pdfResponse.stream);
		// you find other infos in response like pdfResponse.headers, pdfResponse.fileName, pdfResponse.size
	}).catch(function(err){
		console.log('Something gone very wrong: ' + err.message);
	});
});

app.get('/url-link.pdf', function(req, res){
	pdfLayer.generate('http://www.example.com/link/to/html/doc.html', {
		css_url: 'http://www.example.com/link/to/pdf-specific/style.css' //This is an option object. Follow https://pdflayer.com/documentation for more infos.
	}).then(function(pdfResponse){
		// You can stream the response to an html res object like this;
		res.pipe(pdfResponse.stream);
		// you find other infos in response like pdfResponse.headers, pdfResponse.fileName, pdfResponse.size
	}).catch(function(err){
		console.log('Something gone very wrong: ' + err.message);
	});
});

app.listen(3000);
```

## Allowed Options

Follow [PdfLayer APID Documentation](https://pdflayer.com/documentation) for a list of options.

The options you can pass in 'generate' calls are defined in const __DEFAULT_REQUEST_KEYS__. They mirrors PdfLayer guideline at the moment of writing.

The "main config options" (the ones you pass when you create an instance of the library) are:

```json

{
	"apiUrl": "http://api.pdflayer.com/api/convert",
	"method": "POST",
	"apiKey": "YOUR API KEY"
}
```

in addition to the __DEFAULT_REQUEST_KEYS__ list.

Set the apiUrl to 'https://api.pdflayer.com/api/convert' if you want encription and you have a paid plan.

If pdflayer response with an error the Promise will be rejected with the error code, name and message returned from the API.

See a list of possible error responses on [PdfLayer API Documentation Error Codes Section](https://pdflayer.com/documentation#error_codes).

## Yada Yada Words

This is __NOT__ the official pdflayer API Node.js Library! 

I just wrote it for one of my projects as it was missing. 

I will improve and debug it but, as the ISC license proclaim, this software is provided "as is". Consider it in "__beta__" at the moment. 

## Contributing

Please read [CONTRIBUTING.md](https://github.com/giano/pdflayer/blob/master/contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/giano/pdflayer/tags). 

## Authors

* **Stefano Valicchia** - *Initial work* - [giano](https://github.com/giano/pdflayer)

See also the list of [contributors](https://github.com/giano/pdflayer/contributors) who participated in this project.

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details
