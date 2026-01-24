# Abhedya .NET SDK

C# Bindings for Abhedya Post-Quantum Cryptography.

## Requirements

- .NET 8.0 SDK
- Rust (to build native core)

## Usage

```csharp
using Abhedyam.Sdk;
using System.Text;

var keys = Abhedya.GenerateKeys();

byte[] msg = Encoding.UTF8.GetBytes("Hello World");
byte[] ciphertext = Abhedya.Encrypt(keys.PublicKey, msg);

byte[] decrypted = Abhedya.Decrypt(keys.SecretKey, ciphertext);
Console.WriteLine(Encoding.UTF8.GetString(decrypted));
```

## Building

```bash
dotnet build
dotnet pack -c Release
```
