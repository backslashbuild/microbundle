import path from 'path';
import fs from 'fs';
import { createFilter } from 'rollup-pluginutils';

const PATH_SEPARATOR = '/';

const exists = uri => {
	try {
		return fs.statSync(uri).isFile();
	} catch (e) {
		return false;
	}
};

export default function({ include, exclude }) {
	return {
		resolveId(importee, importer) {
			const filter = createFilter(include, exclude);

			if (path.extname(importee) !== '') {
				return null;
			}

			if (!filter(importee) || !filter(importer)) {
				return null;
			}

			const splitImportee = importee.split(PATH_SEPARATOR);
			const directory = splitImportee.pop();

			const potentialMatch = '<dir>/<dir>.js'.replace(/<dir>/g, directory);

			const updatedImportee = [
				...splitImportee,
				...potentialMatch.split(PATH_SEPARATOR),
			].join(PATH_SEPARATOR);

			// TODO: Provider better fallback for importer
			const fullPath = path.resolve(
				path.dirname(importer || '.'),
				updatedImportee,
			);

			if (exists(fullPath)) {
				return fullPath;
			}

			return null;
		},
	};
}
