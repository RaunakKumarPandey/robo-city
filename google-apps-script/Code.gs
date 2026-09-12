/**
 * ==============================================================================
 * ROBO CITY — RoboVerse'26 Google Form Response Sync to Supabase Database
 * Organizer: IEEE Student Branch, MMMUT Gorakhpur
 * Response Sheet: "ROBOVERSE'26 (Responses)"
 * Circulated Form: https://forms.gle/ac4YoLdKzPRNNqq88
 * ==============================================================================
 */

// 1. Default Configuration
var CONFIG = {
  // Production Webhook URL (Can be overridden via Script Properties "ROBO_WEBHOOK_URL")
  WEBHOOK_URL: "https://your-domain.com/api/integrations/google-form",
  // Shared Secret (Can be overridden via Script Properties "ROBO_WEBHOOK_SECRET")
  WEBHOOK_SECRET: "robo-verse-26-gform-secret",
  // Expected sheet name (falls back to first sheet if not found)
  SHEET_NAME: "ROBOVERSE'26 (Responses)"
};

/**
 * Flexible header mapping dictionary (Case-insensitive & whitespace-normalized)
 */
var FIELD_MAP = {
  timestamp: ["timestamp", "date", "submission time", "time"],
  responderEmail: ["email address", "responder email", "username"],
  teamName: ["team name", "crew name", "team", "team_name"],
  collegeName: ["college name", "college", "institute", "institute name", "university"],
  teamSize: ["team size", "size of team", "total members", "no of members"],
  leaderName: ["leader name", "captain name", "name", "your name", "full name"],
  branch: ["branch", "department", "dept"],
  course: ["course", "program", "degree"],
  year: ["year", "academic year"],
  leaderEmail: ["email address", "leader email", "captain email", "your email", "email"],
  leaderPhone: ["phone", "contact", "mobile", "whatsapp", "phone number", "contact number", "mobile number"],
  robotName: ["robot name", "bot name", "robot", "bot"],
  robotImageUrl: ["robot image", "bot photo", "image url", "photo url", "bot image"]
};

/**
 * Retrieve Webhook URL from Script Properties or default
 */
function getWebhookUrl() {
  var props = PropertiesService.getScriptProperties();
  return props.getProperty("ROBO_WEBHOOK_URL") || props.getProperty("WEBHOOK_URL") || CONFIG.WEBHOOK_URL;
}

/**
 * Retrieve Shared Secret from Script Properties or default
 */
function getWebhookSecret() {
  var props = PropertiesService.getScriptProperties();
  return props.getProperty("ROBO_WEBHOOK_SECRET") || props.getProperty("GOOGLE_FORM_WEBHOOK_SECRET") || CONFIG.WEBHOOK_SECRET;
}

/**
 * Helper: Find response sheet
 */
function getResponseSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  return sheet;
}

/**
 * ==============================================================================
 * UTILITY: Print and inspect all confirmed headers in Google Sheet
 * ==============================================================================
 */
function logSheetHeaders() {
  var sheet = getResponseSheet();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log("=== DETECTED GOOGLE SHEET HEADERS (" + headers.length + " columns) ===");
  for (var i = 0; i < headers.length; i++) {
    Logger.log("Column " + (i + 1) + ": '" + headers[i] + "'");
  }
  Logger.log("===============================================================");
}

/**
 * ==============================================================================
 * 1. ONE-TIME BULK IMPORT OF EXISTING RESPONSES
 * Run this function from Apps Script Editor to import all existing responses
 * ==============================================================================
 */
function importExistingResponses() {
  var sheet = getResponseSheet();
  var lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    Logger.log("No data rows found to import in sheet: " + sheet.getName());
    return;
  }

  var totalRows = lastRow - 1;
  Logger.log("Starting bulk import of " + totalRows + " existing responses...");

  var importedCount = 0;
  var duplicateCount = 0;
  var needsReviewCount = 0;
  var failedCount = 0;

  for (var r = 2; r <= lastRow; r++) {
    var result = syncRowToRoboCity(sheet, r);
    if (result.success) {
      if (result.duplicate) {
        duplicateCount++;
      } else if (result.syncStatus === "needs_review") {
        needsReviewCount++;
        importedCount++;
      } else {
        importedCount++;
      }
    } else {
      failedCount++;
    }
  }

  Logger.log("==========================================");
  Logger.log("       ROBO CITY IMPORT SUMMARY          ");
  Logger.log("==========================================");
  Logger.log("Total Processed Rows: " + totalRows);
  Logger.log("Successfully Synchronized: " + importedCount);
  Logger.log("Skipped Duplicates (Already Synced): " + duplicateCount);
  Logger.log("Flagged For Admin Review: " + needsReviewCount);
  Logger.log("Failed: " + failedCount);
  Logger.log("==========================================");
}

/**
 * ==============================================================================
 * 2. REAL-TIME TRIGGER FOR NEW FORM SUBMISSIONS
 * Install this via: Triggers -> Add Trigger -> onFormSubmit -> On form submit
 * ==============================================================================
 */
function onFormSubmit(e) {
  try {
    var sheet = e.range ? e.range.getSheet() : getResponseSheet();
    var rowNumber = e.range ? e.range.getRow() : sheet.getLastRow();
    
    Logger.log("Processing new form submission at row: " + rowNumber);
    syncRowToRoboCity(sheet, rowNumber);
  } catch (err) {
    Logger.log("onFormSubmit Trigger Error: " + err.toString());
  }
}

/**
 * ==============================================================================
 * Core Sync Logic for a Single Row
 * ==============================================================================
 */
function syncRowToRoboCity(sheet, rowNumber) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowValues = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Extract normalized payload
  var payload = buildPayloadFromRow(headers, rowValues, rowNumber);
  
  // Dispatch HTTP POST with HMAC SHA-256
  var result = sendToWebsiteWebhook(payload);
  
  // Update status columns in Google Sheet
  updateSyncStatusInSheet(sheet, rowNumber, headers, result);

  return result;
}

/**
 * Converts row data into standard JSON payload using normalized mapping
 */
function buildPayloadFromRow(headers, rowValues, rowNumber) {
  // Build lookup map: normalized_header -> array of { originalHeader, value }
  var cellMap = {};
  for (var i = 0; i < headers.length; i++) {
    var hRaw = String(headers[i]).trim();
    var hNorm = hRaw.toLowerCase().replace(/[\s_-]+/g, " ");
    if (!cellMap[hNorm]) cellMap[hNorm] = [];
    cellMap[hNorm].push({ original: hRaw, value: rowValues[i] });
  }

  // Helper: Retrieve value from alias list
  function getValue(aliasList) {
    for (var a = 0; a < aliasList.length; a++) {
      var target = aliasList[a].toLowerCase().replace(/[\s_-]+/g, " ");
      for (var k in cellMap) {
        if (k === target || k.indexOf(target) !== -1) {
          var items = cellMap[k];
          for (var j = 0; j < items.length; j++) {
            var v = items[j].value;
            if (v !== undefined && v !== null && String(v).trim() !== "") {
              return String(v).trim();
            }
          }
        }
      }
    }
    return "";
  }

  // Extract confirmed fields
  var timestamp = getValue(FIELD_MAP.timestamp);
  var responderEmail = getValue(FIELD_MAP.responderEmail);
  var teamName = getValue(FIELD_MAP.teamName);
  var collegeName = getValue(FIELD_MAP.collegeName);
  var teamSizeRaw = getValue(FIELD_MAP.teamSize);
  var leaderName = getValue(FIELD_MAP.leaderName);
  var branch = getValue(FIELD_MAP.branch);
  var course = getValue(FIELD_MAP.course);
  var year = getValue(FIELD_MAP.year);
  var leaderEmail = getValue(FIELD_MAP.leaderEmail);
  var leaderPhone = getValue(FIELD_MAP.leaderPhone);
  var robotName = getValue(FIELD_MAP.robotName);
  var robotImageUrl = getValue(FIELD_MAP.robotImageUrl);

  // If leaderEmail equals responderEmail or is empty, use available
  var finalCaptainEmail = leaderEmail || responderEmail || "leader@domain.com";

  // Parse declared team size
  var declaredSize = parseInt(teamSizeRaw, 10);
  if (isNaN(declaredSize)) declaredSize = 3;

  // Build members array
  var members = [];

  // Member 1 (Captain / Leader)
  if (leaderName) {
    members.push({
      name: leaderName,
      email: finalCaptainEmail,
      phone: leaderPhone || "",
      branch: branch || "",
      year: year || "",
      role: "Captain / Leader"
    });
  }

  // Scan for additional member columns (e.g. Member 2 Name, Member 3 Name...)
  for (var m = 2; m <= 5; m++) {
    var mPrefix = "member " + m;
    var tmPrefix = "team member " + m;
    var mName = getValue([mPrefix + " name", tmPrefix + " name", mPrefix, tmPrefix]);
    if (mName) {
      members.push({
        name: mName,
        email: getValue([mPrefix + " email", tmPrefix + " email"]) || "",
        phone: getValue([mPrefix + " phone", mPrefix + " contact", tmPrefix + " phone"]) || "",
        branch: getValue([mPrefix + " branch", tmPrefix + " branch"]) || branch || "",
        year: getValue([mPrefix + " year", tmPrefix + " year"]) || year || "",
        role: getValue([mPrefix + " role", tmPrefix + " role"]) || "Crew Member"
      });
    }
  }

  // Deterministic External Response ID (prevents duplicate imports)
  var cleanTimestamp = timestamp ? new Date(timestamp).getTime() : "no-ts";
  var deterministicId = "gform-row-" + rowNumber + "-" + cleanTimestamp;

  return {
    source: "google_form",
    response_id: deterministicId,
    submitted_at: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
    team: {
      team_name: teamName || ("Crew Row " + rowNumber),
      captain_name: leaderName || "Team Leader",
      captain_email: finalCaptainEmail,
      captain_phone: leaderPhone || "N/A",
      college_name: collegeName || "MMMUT Gorakhpur",
      course: course || "",
      branch: branch || "",
      year: year || "",
      responder_email: responderEmail || "",
      declared_team_size: declaredSize
    },
    members: members,
    robot: robotName ? {
      robot_name: robotName,
      robot_image_url: robotImageUrl || null
    } : undefined
  };
}

/**
 * ==============================================================================
 * HMAC SHA-256 Webhook Dispatcher
 * ==============================================================================
 */
function sendToWebsiteWebhook(payload) {
  var url = getWebhookUrl();
  var secret = getWebhookSecret();
  var payloadString = JSON.stringify(payload);

  // Generate HMAC SHA-256 Signature
  var rawSignature = Utilities.computeHmacSha256Signature(payloadString, secret);
  var signatureHex = rawSignature.map(function(byte) {
    var v = (byte < 0 ? byte + 256 : byte).toString(16);
    return v.length === 1 ? "0" + v : v;
  }).join("");

  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "X-Robo-Signature": signatureHex,
    },
    payload: payloadString,
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var statusCode = response.getResponseCode();
    var responseText = response.getContentText();
    var responseJson = {};
    try {
      responseJson = JSON.parse(responseText);
    } catch(e) {}

    return {
      success: statusCode === 200 && responseJson.success === true,
      duplicate: responseJson.duplicate === true,
      syncStatus: responseJson.sync_status || (responseJson.success ? "synced" : "failed"),
      registrationNumber: responseJson.registration_number || "",
      statusCode: statusCode,
      message: responseJson.message || responseText
    };
  } catch (err) {
    return {
      success: false,
      duplicate: false,
      syncStatus: "failed",
      registrationNumber: "",
      statusCode: 500,
      message: err.toString()
    };
  }
}

/**
 * Writes Sync Status, Robo City Reg ID, and Timestamp back to Google Sheet
 */
function updateSyncStatusInSheet(sheet, rowNumber, headers, result) {
  var statusCol = -1;
  var regIdCol = -1;
  var timeCol = -1;

  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i]).toLowerCase();
    if (h.indexOf("sync status") !== -1) statusCol = i + 1;
    if (h.indexOf("registration id") !== -1 || h.indexOf("robo city reg id") !== -1) regIdCol = i + 1;
    if (h.indexOf("synced at") !== -1 || h.indexOf("sync time") !== -1) timeCol = i + 1;
  }

  var lastCol = sheet.getLastColumn();
  if (statusCol === -1) {
    statusCol = lastCol + 1;
    sheet.getRange(1, statusCol).setValue("Sync Status");
    lastCol++;
  }
  if (regIdCol === -1) {
    regIdCol = lastCol + 1;
    sheet.getRange(1, regIdCol).setValue("Robo City Reg ID");
    lastCol++;
  }
  if (timeCol === -1) {
    timeCol = lastCol + 1;
    sheet.getRange(1, timeCol).setValue("Synced At");
  }

  // Compute status text
  var statusText = "SYNCED";
  if (!result.success) {
    statusText = "FAILED";
  } else if (result.syncStatus === "needs_review") {
    statusText = "NEEDS REVIEW";
  } else if (result.duplicate) {
    statusText = "SYNCED (EXISTING)";
  }

  sheet.getRange(rowNumber, statusCol).setValue(statusText);
  if (result.registrationNumber) {
    sheet.getRange(rowNumber, regIdCol).setValue(result.registrationNumber);
  }
  sheet.getRange(rowNumber, timeCol).setValue(new Date().toLocaleString());
}

/**
 * Test Connection Function
 */
function testWebhookConnection() {
  var testPayload = {
    source: "google_form",
    response_id: "test-" + Date.now(),
    submitted_at: new Date().toISOString(),
    team: {
      team_name: "CYBER VIPERS " + Math.floor(Math.random() * 1000),
      captain_name: "Test Leader",
      captain_email: "leader@test.com",
      captain_phone: "+91 9876543210",
      college_name: "MMMUT Gorakhpur",
      branch: "ECE",
      course: "B.Tech",
      year: "3rd",
      responder_email: "responder@test.com",
      declared_team_size: 3
    },
    members: [
      { name: "Test Leader", email: "leader@test.com", phone: "+91 9876543210", branch: "ECE", year: "3rd", role: "Captain" },
      { name: "Crew Member 2", email: "member2@test.com", phone: "", branch: "ECE", year: "3rd", role: "Driver" },
      { name: "Crew Member 3", email: "member3@test.com", phone: "", branch: "CSE", year: "2nd", role: "Programmer" }
    ]
  };

  var res = sendToWebsiteWebhook(testPayload);
  Logger.log("=== TEST CONNECTION RESULT ===");
  Logger.log(JSON.stringify(res, null, 2));
}
