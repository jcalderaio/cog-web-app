export default {
    getQueryVariable: (variable) => {
        const hashParts = window.location.hash.split('?');
        const query = (hashParts && hashParts[1]) ? hashParts[1]:'';
        const vars = query.split('&');
        let value = null;

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) === variable) {
                // if undefined (key is present, value is not), set boolean true
                // to indicate that the querystring param is present
                value = (pair[1]) ? decodeURIComponent(pair[1]):true;
            }
        }
        // console.log('Query variable %s not found', variable);
        return value;
    }
  };