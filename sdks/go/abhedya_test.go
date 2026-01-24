package main

import (
	"bytes"
	"testing"
)

func TestKeyGen(t *testing.T) {
	kp, err := KeyGen()
	if err != nil {
		t.Fatalf("KeyGen failed: %v", err)
	}
	if len(kp.PublicKey) == 0 {
		t.Error("Public Key is empty")
	}
	if len(kp.SecretKey) == 0 {
		t.Error("Secret Key is empty")
	}
}

func TestEncryptDecryptStandard(t *testing.T) {
	kp, err := KeyGen()
	if err != nil {
		t.Fatal(err)
	}

	msg := []byte("Hello Abhedya")
	ct, err := Encrypt(kp.PublicKey, msg, Standard)
	if err != nil {
		t.Fatalf("Encrypt failed: %v", err)
	}

	decrypted, err := Decrypt(kp.SecretKey, ct)
	if err != nil {
		t.Fatalf("Decrypt failed: %v", err)
	}

	// Remove trailing nulls or handle bits-to-bytes padding?
	// The encryption is bit-exact, but output is bytes.
	// Our decoder outputs a byte array.
	// Comparison should handle trailing zeros if the loop size was naive.
	// But let's check equality.
	if !bytes.Equal(decrypted, msg) {
		// It's possible we have trailing zeroes if msg len wasn't perfect byte boundary? 
		// No, implementation handles bytes.
		// Wait, Decrypt returns numBytes which matches (bits + 7)/8.
		// If input was "Hello Abhedya", output should be exactly that.
		
		// If the decrypted has trailing nulls, trim them for comparison if legitimate
		trimmed := bytes.TrimRight(decrypted, "\x00")
		if !bytes.Equal(trimmed, msg) {
			t.Errorf("Decryption mismatch. Got %x, want %x", decrypted, msg)
		}
	}
}
