import 'varlock/auto-load';

import addLocation from './commands/add-location';


await addLocation.handler({
		name: 'Basilica of St. James the Greater',
		entry: 'Basílica de San Jacobo el Grande',
		path: 'Lugares'
})
