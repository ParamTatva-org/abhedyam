using System.Runtime.InteropServices;

namespace Abhedyam.Sdk;

public enum EncryptionMode : int
{
    Standard = 0,
    Metered = 1
}

public class AbhedyaKey
{
    public byte[] PublicKey { get; }
    public byte[] SecretKey { get; }

    public AbhedyaKey(byte[] pk, byte[] sk)
    {
        PublicKey = pk;
        SecretKey = sk;
    }
}

public static class Abhedya
{
    private const string LibName = "abhedya_ffi";
    private const int N = 768;
    private const int BlockSize = (N + 1) * 2;

    [DllImport(LibName, CallingConvention = CallingConvention.Cdecl, EntryPoint = "abhedya_keygen")]
    private static extern int NativeKeyGen(byte[] pkBuf, ref nuint pkLen, byte[] skBuf, ref nuint skLen);

    [DllImport(LibName, CallingConvention = CallingConvention.Cdecl, EntryPoint = "abhedya_encrypt")]
    private static extern int NativeEncrypt(byte[] pkBuf, nuint pkLen, byte[] msg, nuint msgLen, int mode, byte[] outBuf, ref nuint outLen);

    [DllImport(LibName, CallingConvention = CallingConvention.Cdecl, EntryPoint = "abhedya_decrypt")]
    private static extern int NativeDecrypt(byte[] skBuf, nuint skLen, byte[] ct, nuint ctLen, byte[] outBuf, ref nuint outLen);

    public static AbhedyaKey GenerateKeys()
    {
        int pkSize = (N * N + N) * 2;
        int skSize = N * 2;

        byte[] pkArg = new byte[pkSize];
        byte[] skArg = new byte[skSize];
        nuint pkLen = (nuint)pkSize;
        nuint skLen = (nuint)skSize;

        int res = NativeKeyGen(pkArg, ref pkLen, skArg, ref skLen);
        if (res != 0) throw new Exception($"KeyGen failed with code {res}");

        // Resize if needed (impl won't return less, but good practice)
        return new AbhedyaKey(pkArg[..(int)pkLen], skArg[..(int)skLen]);
    }

    public static byte[] Encrypt(byte[] publicKey, byte[] message, EncryptionMode mode = EncryptionMode.Standard)
    {
        int numBits = message.Length * 8;
        int maxOutLen = numBits * BlockSize;

        byte[] outBuf = new byte[maxOutLen];
        nuint outLen = (nuint)maxOutLen;

        int res = NativeEncrypt(publicKey, (nuint)publicKey.Length, message, (nuint)message.Length, (int)mode, outBuf, ref outLen);
        if (res != 0) throw new Exception($"Encrypt failed with code {res}");

        return outBuf[..(int)outLen];
    }

    public static byte[] Decrypt(byte[] secretKey, byte[] ciphertext)
    {
        if (ciphertext.Length % BlockSize != 0)
            throw new ArgumentException("Invalid ciphertext length");

        int numBits = ciphertext.Length / BlockSize;
        int numBytes = (numBits + 7) / 8;

        byte[] outBuf = new byte[numBytes];
        nuint outLen = (nuint)numBytes;

        int res = NativeDecrypt(secretKey, (nuint)secretKey.Length, ciphertext, (nuint)ciphertext.Length, outBuf, ref outLen);
        if (res != 0) throw new Exception($"Decrypt failed with code {res}");

        return outBuf[..(int)outLen];
    }
}
