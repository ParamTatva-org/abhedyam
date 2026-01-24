package main

/*
#cgo LDFLAGS: -L../../target/release -labhedya_ffi
#include <stdlib.h>
#include <stdint.h>
#include <stdbool.h>

// Define Enum
typedef enum {
    Standard = 0,
    Metered = 1
} EncryptionModeC;

// Prototypes
// Must match rust exports exactly.
int abhedya_keygen(unsigned char* pk_buf, size_t* pk_len, unsigned char* sk_buf, size_t* sk_len);
int abhedya_encrypt(const unsigned char* pk_buf, size_t pk_len, const unsigned char* msg_ptr, size_t msg_len, EncryptionModeC mode, unsigned char* out_buf, size_t* out_len);
int abhedya_decrypt(const unsigned char* sk_buf, size_t sk_len, const unsigned char* ct_ptr, size_t ct_len, unsigned char* out_buf, size_t* out_len);
*/
import "C"

import (
	"errors"
	"fmt"
	"unsafe"
)

// Constants defining the cryptographic parameters
const (
	// N is the lattice dimension
	N = 768
	// BlockSize is the size of one encrypted block in bits
	BlockSize = (N + 1) * 2
)

// EncryptionMode determines the operational mode of the cipher
type EncryptionMode int

const (
	// Standard mode uses optimized LWE noise for maximum throughput and security.
	Standard EncryptionMode = 0
	// Metered mode shapes the noise to map to valid Sanskrit prosody (Steganography).
	Metered EncryptionMode = 1
)

// KeyPair holds the Public and Secret keys.
type KeyPair struct {
	PublicKey []byte
	SecretKey []byte
}

// KeyGen generates a new Lattice-based KeyPair (Kyber-768 equivalent).
func KeyGen() (*KeyPair, error) {
	// Pk: (NxN + N) * 2 bytes
	pkSize := (N*N + N) * 2
	// Sk: N * 2 bytes
	skSize := N * 2

	pkBuf := make([]byte, pkSize)
	skBuf := make([]byte, skSize)

	var pkLen C.size_t = C.size_t(pkSize)
	var skLen C.size_t = C.size_t(skSize)

	res := C.abhedya_keygen(
		(*C.uchar)(unsafe.Pointer(&pkBuf[0])),
		&pkLen,
		(*C.uchar)(unsafe.Pointer(&skBuf[0])),
		&skLen,
	)

	if res != 0 {
		return nil, fmt.Errorf("keygen failed with code %d", res)
	}

	return &KeyPair{
		PublicKey: pkBuf[:pkLen],
		SecretKey: skBuf[:skLen],
	}, nil
}

// Encrypt encrypts a message using the provided Public Key.
// mode selector allows choosing between Standard (Defense) and Metered (Offense) modes.
func Encrypt(pk []byte, msg []byte, mode EncryptionMode) ([]byte, error) {
	// Estimate output size
	// Each bit of message becomes a vector of size (N+1)*2 bytes
	numBits := len(msg) * 8
	maxOutLen := numBits * BlockSize

	outBuf := make([]byte, maxOutLen)
	var outLen C.size_t = C.size_t(maxOutLen)

	res := C.abhedya_encrypt(
		(*C.uchar)(unsafe.Pointer(&pk[0])),
		C.size_t(len(pk)),
		(*C.uchar)(unsafe.Pointer(&msg[0])),
		C.size_t(len(msg)),
		C.EncryptionModeC(mode),
		(*C.uchar)(unsafe.Pointer(&outBuf[0])),
		&outLen,
	)

	if res != 0 {
		return nil, fmt.Errorf("encryption failed with code %d", res)
	}

	return outBuf[:outLen], nil
}

// Decrypt recovers the original message using the Secret Key.
func Decrypt(sk []byte, ct []byte) ([]byte, error) {
	if len(ct)%BlockSize != 0 {
		return nil, errors.New("invalid ciphertext length: not aligned to block size")
	}

	numBits := len(ct) / BlockSize
	numBytes := (numBits + 7) / 8

	outBuf := make([]byte, numBytes)
	var outLen C.size_t = C.size_t(numBytes)

	res := C.abhedya_decrypt(
		(*C.uchar)(unsafe.Pointer(&sk[0])),
		C.size_t(len(sk)),
		(*C.uchar)(unsafe.Pointer(&ct[0])),
		C.size_t(len(ct)),
		(*C.uchar)(unsafe.Pointer(&outBuf[0])),
		&outLen,
	)

	if res != 0 {
		return nil, fmt.Errorf("decryption failed with code %d", res)
	}

	return outBuf[:outLen], nil
}
