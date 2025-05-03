import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { saveAs } from 'file-saver';
import moment from 'moment';

const AssignedTeamCard = ({ team, onEvaluateClick }) => {
    const handleDownload = () => {
        if (team.submission && team.submission.fileName && team.submission.fileContentBase64) {
            const byteString = atob(team.submission.fileContentBase64);
            const mimeString = team.submission.fileName.includes('jpg') ? 'image/jpeg' : 'application/octet-stream'; // Adjust based on your file types
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            saveAs(blob, team.submission.fileName);
        } else {
            alert('No submission file available to download.');
        }
    };

    return (
        <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                    {team.team_name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Round: {team.round_number || 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Submitted At: {team.submitted_at ? moment(team.submitted_at).format('DD-MM-YYYY HH:mm') : <Typography variant="body2" color="error">Yet to Submit</Typography>}
                </Typography>

                {team.submission && team.submission.fileName && (
                    <Box mt={1}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Submission: {team.submission.fileName}
                        </Typography>
                        <Button
                            size="small"
                            color="secondary"
                            onClick={handleDownload}
                            sx={{ mt: 0.5 }}
                        >
                            Download
                        </Button>
                    </Box>
                )}

                <Typography variant="body2" color={team.evaluation ? "success" : "textSecondary"} mb={2} mt={2}>
                    Evaluation Status: {team.evaluation ? 'Evaluation Done' : 'Not Evaluated Yet'}
                    {team.evaluation && team.evaluation.total_score && (
                        <Typography variant="body2" color="textSecondary">
                            Total Score: {team.evaluation.total_score}
                        </Typography>
                    )}
                </Typography>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onEvaluateClick(team)}
                    sx={{ mt: 2 }}
                    disabled={!team.submitted_at || team.evaluation} // Disable if evaluation is already done
                >
                    {team.evaluation ? 'View Evaluation' : 'Evaluate'}
                </Button>
            </CardContent>
        </Card>
    );
};

export default AssignedTeamCard;