#ifndef ABHEDYA_H
#define ABHEDYA_H

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/// Encryption Mode for Abhedya
typedef enum {
    ABHEDYA_MODE_STANDARD = 0, // High Performance
    ABHEDYA_MODE_METERED = 1   // Sanskrit Meter (Steganographic)
} AbhedyaEncryptionMode;

/**
 * Generate a new KeyPair.
 * 
 * @param pk_buffer Output buffer for Public Key bits.
 * @param pk_len Pointer to size of pk_buffer. On success, updated with actual length.
 * @param sk_buffer Output buffer for Secret Key bits.
 * @param sk_len Pointer to size of sk_buffer. On success, updated with actual length.
 * @return 0 on success, -1 on failure.
 */
int abhedya_keygen(unsigned char *pk_buffer, size_t *pk_len, 
                   unsigned char *sk_buffer, size_t *sk_len);

/**
 * Encrypt a message.
 * 
 * @param pk_buffer Pointer to the Public Key struct/bytes.
 * @param pk_len Length of the Public Key buffer.
 * @param msg_ptr The plaintext message (bytes).
 * @param msg_len Length of the message.
 * @param mode The encryption mode (Standard/Metered).
 * @param out_buffer Output buffer for the ciphertext.
 * @param out_len Pointer to size of out_buffer. Updated with actual length.
 * @return 0 on success, -1 on failure.
 */
int abhedya_encrypt(const unsigned char *pk_buffer, size_t pk_len,
                    const unsigned char *msg_ptr, size_t msg_len,
                    AbhedyaEncryptionMode mode,
                    unsigned char *out_buffer, size_t *out_len);

/**
 * Decrypt a message.
 * 
 * @param sk_buffer Pointer to the Secret Key bytes.
 * @param sk_len Length of the Secret Key.
 * @param ct_ptr Pointer to the Ciphertext bytes.
 * @param ct_len Length of Ciphertext.
 * @param out_buffer Output buffer for the plaintext.
 * @param out_len Pointer to size of out_buffer. Updated with actual length.
 * @return 0 on success, -1 on failure.
 */
int abhedya_decrypt(const unsigned char *sk_buffer, size_t sk_len,
                    const unsigned char *ct_ptr, size_t ct_len,
                    unsigned char *out_buffer, size_t *out_len);

#ifdef __cplusplus
}
#endif

#endif // ABHEDYA_H
