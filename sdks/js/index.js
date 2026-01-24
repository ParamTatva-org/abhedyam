const koffi = require('koffi');
const path = require('path');
const os = require('os');

const EncryptionMode = {
    STANDARD: 0,
    METERED: 1
};

class Abhedya {
    constructor(libPath) {
        if (!libPath) {
            libPath = this._findLibrary();
        }
        
        try {
            this.lib = koffi.load(libPath);
        } catch (e) {
            throw new Error(`Failed to load library at ${libPath}: ${e.message}`);
        }

        // Define Types
        // Rust boolean is usually 1 byte, but C bool can be int. 
        // We use size_t for lengths.
        
        // KeyGen: (pk_buf, pk_len, sk_buf, sk_len) -> int
        this.fn_keygen = this.lib.func('abhedya_keygen', 'int', ['uint8*', '_Inout_ size_t*', 'uint8*', '_Inout_ size_t*']);

        // Encrypt: (pk, pk_len, msg, msg_len, mode, out, out_len) -> int
        this.fn_encrypt = this.lib.func('abhedya_encrypt', 'int', ['uint8*', 'size_t', 'uint8*', 'size_t', 'int', 'uint8*', '_Inout_ size_t*']);

        // Decrypt: (sk, sk_len, ct, ct_len, out, out_len) -> int
        this.fn_decrypt = this.lib.func('abhedya_decrypt', 'int', ['uint8*', 'size_t', 'uint8*', 'size_t', 'uint8*', '_Inout_ size_t*']);
    }

    _findLibrary() {
        const platform = os.platform();
        let name = 'libabhedya_ffi';
        let ext = '';
        
        if (platform === 'darwin') {
            ext = '.dylib';
        } else if (platform === 'win32') {
            name = 'abhedya_ffi';
            ext = '.dll';
        } else {
            ext = '.so';
        }
        
        const filename = name + ext;
        
        // Search paths: 
        // 1. Env var ABHEDYA_LIB
        // 2. Local debug/release targets (dev mode)
        // 3. System paths (production)
        
        if (process.env.ABHEDYA_LIB) return process.env.ABHEDYA_LIB;

        const devRelease = path.join(__dirname, '../../target/release', filename);
        if (require('fs').existsSync(devRelease)) return devRelease;

        const devDebug = path.join(__dirname, '../../target/debug', filename);
        if (require('fs').existsSync(devDebug)) return devDebug;
        
        // Fallback to expecting it in current dir or globally loadable
        return filename;
    }

    keygen() {
        // Prepare output buffers
        // Kyber-768/Abhedya keys are approx: PK=1184, SK=2400. 
        // We allocate slightly more to be safe.
        const PK_CAP = 2048;
        const SK_CAP = 4096;
        
        let pk = Buffer.alloc(PK_CAP);
        let sk = Buffer.alloc(SK_CAP);
        
        // We need pointers to lengths
        let pk_len = [PK_CAP];
        let sk_len = [SK_CAP];

        const res = this.fn_keygen(pk, pk_len, sk, sk_len);

        if (res !== 0) {
            throw new Error(`KeyGen failed with code ${res}`);
        }

        // Slice to actual size
        // koffi updates the array/object passed for Inout
        return {
            publicKey: pk.subarray(0, pk_len[0]),
            secretKey: sk.subarray(0, sk_len[0])
        };
    }

    encrypt(pk, msg, mode = EncryptionMode.STANDARD) {
        if (!Buffer.isBuffer(pk)) pk = Buffer.from(pk);
        if (!Buffer.isBuffer(msg)) msg = Buffer.from(msg);

        // Estimate ciphertext size
        // Standard ~1KB, Metered can be larger. 
        // 2x message size + overhead should be plenty for safety, 
        // or just a fixed large buffer (e.g. 16KB) if unsure.
        // For Abhedya, CT is fixed size for a block, but let's assume worst case.
        const CT_CAP = 1024 * 64; // 64KB safe upper bound
        let ct = Buffer.alloc(CT_CAP);
        let ct_len = [CT_CAP];

        const res = this.fn_encrypt(
            pk, pk.length,
            msg, msg.length,
            mode,
            ct, ct_len
        );

        if (res !== 0) {
            throw new Error(`Encrypt failed with code ${res}`);
        }

        return ct.subarray(0, ct_len[0]);
    }

    decrypt(sk, ct) {
        if (!Buffer.isBuffer(sk)) sk = Buffer.from(sk);
        if (!Buffer.isBuffer(ct)) ct = Buffer.from(ct);

        const OUT_CAP = 1024 * 64; 
        let out = Buffer.alloc(OUT_CAP);
        let out_len = [OUT_CAP];

        const res = this.fn_decrypt(
            sk, sk.length,
            ct, ct.length,
            out, out_len
        );

        if (res !== 0) {
            throw new Error(`Decrypt failed with code ${res}`);
        }

        return out.subarray(0, out_len[0]);
    }
}

module.exports = { Abhedya, EncryptionMode };
