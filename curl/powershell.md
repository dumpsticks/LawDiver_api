# LawDiver API -- PowerShell recipes (Windows)

Set your key (session-scoped):

```powershell
$env:LAWDIVER_API_KEY = "ld_live_xxxxxxxxxxxxxxxxxxxx"
$Base = "https://lawdiver.com/api/v1"
$Headers = @{
  Authorization = "Bearer $env:LAWDIVER_API_KEY"
  "User-Agent" = "LawDiver-API-Examples/1.0 (+https://github.com/dumpsticks/LawDiver_api; powershell)"
}
```

## Discovery (no key)

```powershell
Invoke-RestMethod -Uri $Base | ConvertTo-Json -Depth 6
```

## Usage

```powershell
Invoke-RestMethod -Uri "$Base/usage?days=30" -Headers $Headers | ConvertTo-Json -Depth 6
```

## Case search

```powershell
$body = @{
  query = "qualified immunity excessive force"
  jurisdiction = @{ type = "federal_circuit"; circuit = "11" }
  limit = 5
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method Post -Uri "$Base/search" -Headers $Headers `
  -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 8
```

## Cite check

```powershell
$body = @{ citations = @("570 U.S. 744", "999 F.3d 1") } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$Base/citecheck/cite" -Headers $Headers `
  -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 8
```

## Retrieve

```powershell
$body = @{ query = "410 U.S. 113" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$Base/cases/retrieve" -Headers $Headers `
  -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 8
```

## Download a case PDF

```powershell
Invoke-WebRequest -Uri "$Base/cases/2812209/pdf" -Headers $Headers -OutFile "windsor.pdf"
```

## Document cite check upload

```powershell
# Multipart upload (poll for status / report yourself)
$file = "C:\path\to\brief.pdf"
Invoke-RestMethod -Method Post -Uri "$Base/citecheck/document" -Headers $Headers `
  -Form @{ file = Get-Item $file } | ConvertTo-Json -Depth 6
```

```powershell
# Email a secure results-page link when the check finishes (poll/PDF still work)
$file = "C:\path\to\brief.pdf"
Invoke-RestMethod -Method Post -Uri "$Base/citecheck/document" -Headers $Headers `
  -Form @{
    file = Get-Item $file
    delivery = "email_link"
    emails = "partner@firm.com", "associate@firm.com"
  } | ConvertTo-Json -Depth 6
```

Prefer the TypeScript or Python example projects for polling loops and typed clients.
