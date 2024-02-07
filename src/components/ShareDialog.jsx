import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Link } from 'react-router-dom';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function ShareDialog(props) {

    return (
        <React.Fragment>
            <BootstrapDialog
                onClose={props.handleClose}
                aria-labelledby="customized-dialog-title"
                open={props.open}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    CodeBall: Share Your Work to others
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={props.handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent dividers style={{ textAlign: 'center' }}>
                    <Typography gutterBottom>
                        Copy the link below and share it with your friends to show them your work.
                    </Typography>
                    <Link to={`/${props.codeBallId ? props.codeBallId : ''}`}>{window.location.href}</Link>
                    <ContentCopyIcon style={{ cursor: 'pointer', marginLeft: '10px' }} onClick={() => {
                        navigator.clipboard.writeText(`${window.location.href}/`);
                        // Indicate that the link has been copied with toast
                        alert('Link copied to clipboard');
                        props.handleClose();
                    }} />
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={props.handleClose}>
                        OK
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}