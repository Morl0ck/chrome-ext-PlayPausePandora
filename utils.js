function parseBool(string) {
	if (string != null)
		return string.toLowerCase() === 'true' ? true : false;
	else
		return false;
}