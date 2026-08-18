/**
 * Paste this into the Apps Script editor as a NEW function, select
 * `diagnoseTiers` in the function dropdown, click Run, then open
 * View -> Logs (or Execution log).
 *
 * It does not change anything. Delete it afterwards if you like.
 */
function diagnoseTiers() {
  const ss = SpreadsheetApp.openById('1UtXZdlSjJLo39vf_vNn1TI67TxkB24ySht1CLPJbhDw');

  Logger.log('--- every tab name, in quotes so stray spaces show ---');
  ss.getSheets().forEach(s => Logger.log('  "%s"', s.getName()));

  const sheet = ss.getSheetByName('discount_tiers');
  if (!sheet) {
    Logger.log('');
    Logger.log('>>> No tab is named exactly "discount_tiers".');
    Logger.log('>>> Check the list above for capitals, a space, or a hyphen.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  Logger.log('');
  Logger.log('rows returned by getDataRange (including the header row): %s', data.length);
  if (data.length < 2) {
    Logger.log('>>> The script needs at least a header row AND one data row.');
    return;
  }

  Logger.log('headers: %s', JSON.stringify(data[0]));
  const isActiveIndex = data[0].indexOf('is_active');
  Logger.log('is_active column index: %s  (-1 means the header is missing or misspelled)', isActiveIndex);

  data.slice(1).forEach((row, n) => {
    const val = isActiveIndex === -1 ? '(no column)' : row[isActiveIndex];
    const kept = isActiveIndex === -1 ? true : (val === true || val === 'TRUE');
    Logger.log('row %s: is_active=%s (type %s) -> %s',
               n + 2, JSON.stringify(val), typeof val,
               kept ? 'KEPT' : 'DROPPED FROM THE FEED');
    if (!kept) {
      Logger.log('    >>> use a real tick box (Insert -> Tick box), not text');
    }
    const pctIndex = data[0].indexOf('percent_off');
    if (pctIndex !== -1) {
      const p = row[pctIndex];
      if (typeof p === 'number' && p > 0 && p < 1) {
        Logger.log('    >>> percent_off is %s - the cell is formatted as a percentage. '
                   + 'Enter %s as a plain number.', p, p * 100);
      }
    }
  });
}
